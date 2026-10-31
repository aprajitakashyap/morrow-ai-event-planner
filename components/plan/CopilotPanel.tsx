"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import { requestCopilotReply } from "@/lib/client";
import type { ChatMessage, Plan, SavedPlan } from "@/lib/types";

type CopilotPanelProps = {
  plan: Plan;
  state: SavedPlan;
  open: boolean;
  onClose: () => void;
  seed: { id: number; text: string } | null;
  onSeedHandled: () => void;
};

const QUICK_PROMPTS = [
  "Where can I find room in the budget?",
  "What should I do next?",
  "What should I ask the venue before a deposit?",
  "How do I make the day work for my grandparents?",
];

function messageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CopilotPanel({
  plan,
  state,
  open,
  onClose,
  seed,
  onSeedHandled,
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      source: plan.source,
      content: `I have read the ${plan.brief.eventName} plan: ${plan.timeline.length} milestones, ${plan.vendors.length} vendor briefs, and a ${plan.budget.healthLabel.toLowerCase()} budget. Ask me about money, vendors, the timeline, access, or ideas.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (!seed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The parent sends a one-off prompt to prefill.
    setInput(seed.text);
    onSeedHandled();
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [seed, onSeedHandled]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    window.setTimeout(() => inputRef.current?.focus(), 30);

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  async function send(value?: string) {
    const text = (value ?? input).trim();
    if (!text || busy) return;

    const userMessage: ChatMessage = {
      id: messageId(),
      role: "user",
      content: text.slice(0, 1000),
    };
    const prior = messages;
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    try {
      const result = await requestCopilotReply(text, plan, state, prior);
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: result.reply,
          source: result.source,
        },
      ]);
      if (result.degraded) setDegraded(true);
    } finally {
      setBusy(false);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <>
      <button
        type="button"
        className={`copilot-backdrop ${open ? "is-open" : ""}`}
        aria-label="Close Vela"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        id="copilot"
        ref={panelRef}
        className={`copilot-panel ${open ? "is-open" : ""}`}
        aria-labelledby="copilot-title"
      >
        <header className="copilot-header">
          <div className="copilot-identity">
            <span className="copilot-avatar" aria-hidden="true">
              V
            </span>
            <div>
              <h2 id="copilot-title">Ask Vela</h2>
              <p>Grounded in this plan</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button copilot-close"
            onClick={onClose}
            aria-label="Close Vela"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div
          className="copilot-log"
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversation with Vela"
          tabIndex={0}
        >
          {messages.map((message) => (
            <div
              className={`chat-message chat-message--${message.role}`}
              key={message.id}
            >
              {message.role === "assistant" && (
                <span className="chat-message__avatar" aria-hidden="true">
                  V
                </span>
              )}
              <div className="chat-bubble">
                {message.content.split("\n").map((line, index) => (
                  <p key={`${message.id}-${index}`}>{line || "\u00A0"}</p>
                ))}
                {message.role === "assistant" && message.source && (
                  <span className="chat-source">
                    {message.source === "ai" ? "Vela · AI" : "Vela · guided"}
                  </span>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="chat-message chat-message--assistant">
              <span className="chat-message__avatar" aria-hidden="true">
                V
              </span>
              <div className="chat-bubble chat-bubble--typing" role="status">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="sr-only">Vela is thinking</span>
              </div>
            </div>
          )}

          {messages.length <= 1 && !busy && (
            <div className="prompt-list">
              <span className="prompt-list__label">Try one of these</span>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="prompt-chip"
                  onClick={() => void send(prompt)}
                >
                  {prompt}
                  <Icon name="arrow-up-right" size={14} />
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="copilot-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <label className="sr-only" htmlFor="copilot-input">
            Ask Vela about this plan
          </label>
          <textarea
            id="copilot-input"
            ref={inputRef}
            rows={2}
            maxLength={1000}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Ask about money, vendors, the timeline, access, or ideas…"
            disabled={busy}
          />
          <button
            type="submit"
            className="send-button"
            disabled={busy || input.trim().length === 0}
            aria-label="Send message to Vela"
          >
            <Icon name="send" size={17} />
          </button>
        </form>

        <footer className="copilot-footer">
          <Icon name="shield" size={14} />
          <span>
            {degraded
              ? "Guided mode is active. Vela is using your plan, not an external model."
              : "Grounded in your numbers. It will not invent a booking or a price."}
          </span>
        </footer>
      </aside>
    </>
  );
}
