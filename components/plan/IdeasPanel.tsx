"use client";

import { Icon } from "@/components/ui/Icon";
import type { Idea, Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

type IdeasPanelProps = {
  plan: Plan;
  savedIdeaIds: string[];
  onToggleIdea: (ideaId: string) => void;
  onAskVela: (prompt: string) => void;
};

const COST_LABEL: Record<Idea["costLevel"], string> = {
  low: "Low cost",
  medium: "Medium cost",
  high: "High cost",
};

export function IdeasPanel({
  plan,
  savedIdeaIds,
  onToggleIdea,
  onAskVela,
}: IdeasPanelProps) {
  const saved = new Set(savedIdeaIds);

  return (
    <div className="panel-stack">
      <section className="ideas-hero" aria-labelledby="ideas-title">
        <div>
          <p className="eyebrow">Personal, not generic</p>
          <h2 className="display" id="ideas-title">
            Small ideas, <em>well chosen.</em>
          </h2>
          <p>
            These are tuned to {plan.brief.eventName}, your priorities, and the way
            the day will actually run. Save the ones worth discussing; leave the rest.
          </p>
        </div>
        <div className="ideas-hero__aside">
          <span className="ideas-count">{savedIdeaIds.length}</span>
          <span>ideas saved for later</span>
          <button
            type="button"
            className="button button--soft button--small"
            onClick={() =>
              onAskVela("Give me one more specific, low-cost idea that fits this plan.")
            }
          >
            <Icon name="sparkles" size={16} />
            Ask Vela for another
          </button>
        </div>
      </section>

      <div className="idea-grid">
        {plan.ideas.map((idea, index) => {
          const isSaved = saved.has(idea.id);
          return (
            <article className={cn("idea-card", isSaved && "is-saved")} key={idea.id}>
              <header className="idea-card__header">
                <span className="idea-card__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="tag">{idea.category}</span>
                <span className={cn("cost-tag", `cost-tag--${idea.costLevel}`)}>
                  {COST_LABEL[idea.costLevel]}
                </span>
              </header>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <footer className="idea-card__footer">
                <div className="tag-row">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <span className="tag tag--quiet" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className={cn("save-button", isSaved && "is-active")}
                  aria-pressed={isSaved}
                  onClick={() => onToggleIdea(idea.id)}
                >
                  <Icon name="bookmark" size={15} />
                  {isSaved ? "Saved" : "Save idea"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>

      <section className="panel-card" aria-labelledby="ideas-rule-title">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">A useful rule</p>
            <h2 id="ideas-rule-title">One good moment beats five half-finished ones</h2>
          </div>
        </header>
        <p>
          Choose a single idea to execute properly, then put it in the timeline with an
          owner and a date. A welcome detail, a thoughtful toast, or one excellent food
          moment will read as more intentional than a long list of extras.
        </p>
      </section>
    </div>
  );
}
