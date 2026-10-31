"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BudgetPanel } from "@/components/plan/BudgetPanel";
import { CopilotPanel } from "@/components/plan/CopilotPanel";
import { IdeasPanel } from "@/components/plan/IdeasPanel";
import { OverviewPanel } from "@/components/plan/OverviewPanel";
import { TimelinePanel } from "@/components/plan/TimelinePanel";
import { VendorsPanel } from "@/components/plan/VendorsPanel";
import type { WorkspaceTab } from "@/components/plan/types";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { downloadCalendar } from "@/lib/calendar";
import { daysUntil, formatDate, formatShortDate, formatWeekday } from "@/lib/dates";
import { buildPlan } from "@/lib/planner";
import { sampleBrief } from "@/lib/sample";
import {
  clearSavedPlan,
  emptySavedPlan,
  readSavedPlan,
  stageBriefForEditing,
  takeTransientNotice,
  writeSavedPlan,
} from "@/lib/storage";
import {
  EVENT_TYPE_META,
  type SavedPlan,
  type VendorStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: WorkspaceTab; label: string; icon: IconName }> = [
  { id: "overview", label: "Overview", icon: "compass" },
  { id: "budget", label: "Budget", icon: "wallet" },
  { id: "timeline", label: "Timeline", icon: "calendar" },
  { id: "vendors", label: "Vendors", icon: "users" },
  { id: "ideas", label: "Ideas", icon: "sparkles" },
];

export function PlanWorkspace() {
  const router = useRouter();
  const [state, setState] = useState<SavedPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [seed, setSeed] = useState<{ id: number; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const saved = readSavedPlan();
    const params = new URLSearchParams(window.location.search);
    const demo = params.get("demo") === "1";

    if (demo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL and localStorage are only available after mount.
      setState(emptySavedPlan(buildPlan(sampleBrief())));
      setIsSample(true);
    } else if (saved) {
      setState(saved);
    }

    const message = takeTransientNotice();
    if (message) setNotice(message);
    setReady(true);
  }, []);

  const commit = useCallback(
    (mutator: (current: SavedPlan) => SavedPlan) => {
      if (!state) return;
      const next = { ...mutator(state), updatedAt: new Date().toISOString() };
      setState(next);
      if (!isSample && !writeSavedPlan(next)) {
        setNotice(
          "Your browser blocked local storage. The plan is still usable, but changes will not survive a refresh.",
        );
      }
    },
    [state, isSample],
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      commit((current) => ({
        ...current,
        completedTaskIds: current.completedTaskIds.includes(taskId)
          ? current.completedTaskIds.filter((id) => id !== taskId)
          : [...current.completedTaskIds, taskId],
      }));
    },
    [commit],
  );

  const setVendorStatus = useCallback(
    (vendorId: string, status: VendorStatus) => {
      commit((current) => ({
        ...current,
        vendorStatuses: { ...current.vendorStatuses, [vendorId]: status },
      }));
    },
    [commit],
  );

  const toggleIdea = useCallback(
    (ideaId: string) => {
      commit((current) => ({
        ...current,
        savedIdeaIds: current.savedIdeaIds.includes(ideaId)
          ? current.savedIdeaIds.filter((id) => id !== ideaId)
          : [...current.savedIdeaIds, ideaId],
      }));
    },
    [commit],
  );

  const closeCopilot = useCallback(() => setCopilotOpen(false), []);
  const seedHandled = useCallback(() => setSeed(null), []);

  function askVela(prompt: string) {
    setSeed({ id: Date.now(), text: prompt });
    setCopilotOpen(true);
    window.setTimeout(() => {
      document.getElementById("copilot-input")?.focus();
    }, 60);
  }

  function refineBrief() {
    if (!state) return;
    stageBriefForEditing(state.plan.brief);
    router.push("/create");
  }

  function removePlan() {
    clearSavedPlan();
    setState(null);
    setIsSample(false);
    setConfirmReset(false);
    setTab("overview");
    setNotice("The plan was removed from this browser.");
  }

  function adoptSample() {
    if (!state) return;
    const saved = writeSavedPlan({ ...state, updatedAt: new Date().toISOString() });
    if (!saved) {
      setNotice("Your browser blocked local storage, so this sample cannot be saved.");
      return;
    }
    setIsSample(false);
    setNotice("The sample plan now belongs to you. Every change is saved locally.");
    // Drop ?demo=1 so a refresh opens the saved copy instead of a fresh sample.
    router.replace("/plan");
  }

  const days = useMemo(
    () => (state ? daysUntil(state.plan.brief.date) : 0),
    [state],
  );

  if (!ready) {
    return (
      <div className="workspace-loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        Opening your plan…
      </div>
    );
  }

  if (!state) {
    return <EmptyWorkspace notice={notice} onDismiss={() => setNotice(null)} />;
  }

  const { plan } = state;
  const completedTasks = plan.timeline.filter((task) =>
    state.completedTaskIds.includes(task.id),
  ).length;

  return (
    <div className="workspace">
      <header className="workspace-topbar">
        <div className="container workspace-topbar__inner">
          <Logo />
          <div className="workspace-topbar__actions">
            {!isSample && (
              <button type="button" className="button button--ghost button--small" onClick={refineBrief}>
                <Icon name="edit" size={15} />
                Refine brief
              </button>
            )}
            <button type="button" className="icon-button" onClick={() => window.print()} aria-label="Print plan">
              <Icon name="printer" size={18} />
            </button>
            <button type="button" className="button button--primary button--small" onClick={() => askVela("What should I do next?")}>
              <Icon name="sparkles" size={16} />
              Ask Vela
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="container workspace-main">
        <section className="plan-hero" aria-labelledby="plan-title">
          <div>
            <p className="eyebrow">
              <span>{EVENT_TYPE_META[plan.brief.eventType].label}</span>
              <span className="eyebrow__divider" aria-hidden="true">
                ·
              </span>
              {formatWeekday(plan.brief.date)} {formatDate(plan.brief.date)}
            </p>
            <h1 className="display" id="plan-title">
              {plan.brief.eventName}
            </h1>
            <p className="plan-hero__meta">
              <span>
                <Icon name="map-pin" size={15} />
                {plan.brief.location}
              </span>
              <span>
                <Icon name="users" size={15} />
                {plan.brief.guestCount} guests
              </span>
              <span>
                <Icon name="calendar" size={15} />
                {days} days to go
              </span>
              <span>
                <Icon name="sparkles" size={15} />
                {plan.brief.style}
              </span>
            </p>
          </div>
          <div className="plan-hero__actions">
            <button
              type="button"
              className="button button--soft button--small"
              onClick={() => downloadCalendar(plan)}
            >
              <Icon name="download" size={16} />
              Calendar file
            </button>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => window.print()}
            >
              <Icon name="printer" size={16} />
              Print
            </button>
          </div>
        </section>

        {isSample && (
          <div className="sample-banner" role="status">
            <div>
              <Icon name="sparkles" size={17} />
              <p>
                <strong>Sample plan.</strong> Changes are temporary until you save it.
                The sample uses a wedding for 180 guests in Jaipur.
              </p>
            </div>
            <div className="sample-banner__actions">
              <button type="button" className="button button--soft button--small" onClick={adoptSample}>
                Use this plan
              </button>
              <Link className="button button--primary button--small" href="/create">
                Plan my own
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        )}

        {notice && (
          <div className="workspace-notice" role="status">
            <Icon name="info" size={17} />
            <p>{notice}</p>
            <button type="button" className="icon-button" onClick={() => setNotice(null)} aria-label="Dismiss message">
              <Icon name="close" size={15} />
            </button>
          </div>
        )}

        <div className="workspace-layout">
          <div className="workspace-content">
            <div className="workspace-tabbar">
              <nav className="workspace-tabs" aria-label="Plan sections">
                {TABS.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cn("workspace-tab", active && "is-active")}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setTab(item.id)}
                    >
                      <Icon name={item.icon} size={17} />
                      <span>{item.label}</span>
                      {item.id === "timeline" && (
                        <small>
                          {completedTasks}/{plan.timeline.length}
                        </small>
                      )}
                      {item.id === "vendors" && (
                        <small>
                          {plan.vendors.filter((vendor) => state.vendorStatuses[vendor.id] === "booked").length}
                        </small>
                      )}
                      {item.id === "ideas" && <small>{state.savedIdeaIds.length}</small>}
                    </button>
                  );
                })}
              </nav>
              <button
                type="button"
                className="button button--ghost button--small workspace-reset"
                onClick={() => setConfirmReset(true)}
              >
                <Icon name="trash" size={15} />
                Start over
              </button>
            </div>

            {confirmReset && (
              <div className="confirm-bar" role="alert">
                <p>
                  <strong>Start over?</strong> This removes the plan and all progress from
                  this browser. It cannot be undone.
                </p>
                <div>
                  <button type="button" className="button button--ghost button--small" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </button>
                  <button type="button" className="button button--danger button--small" onClick={removePlan}>
                    Remove plan
                  </button>
                </div>
              </div>
            )}

            <div className="workspace-panel">
              {tab === "overview" && (
                <OverviewPanel
                  plan={plan}
                  state={state}
                  days={days}
                  onToggleTask={toggleTask}
                  onNavigate={setTab}
                />
              )}
              {tab === "budget" && <BudgetPanel plan={plan} />}
              {tab === "timeline" && (
                <TimelinePanel
                  plan={plan}
                  completedTaskIds={state.completedTaskIds}
                  onToggleTask={toggleTask}
                  onDownloadCalendar={() => downloadCalendar(plan)}
                  onPrint={() => window.print()}
                />
              )}
              {tab === "vendors" && (
                <VendorsPanel
                  plan={plan}
                  state={state}
                  onSetVendorStatus={setVendorStatus}
                />
              )}
              {tab === "ideas" && (
                <IdeasPanel
                  plan={plan}
                  savedIdeaIds={state.savedIdeaIds}
                  onToggleIdea={toggleIdea}
                  onAskVela={askVela}
                />
              )}
            </div>

            <footer className="workspace-footer">
              <span>
                <Icon name="shield" size={14} />
                {isSample ? "Sample data only" : "Saved in this browser only"}
              </span>
              <span>Last updated {formatShortDate(state.updatedAt.slice(0, 10))}</span>
              <Link href="/">Morrow</Link>
            </footer>
          </div>

          <CopilotPanel
            plan={plan}
            state={state}
            open={copilotOpen}
            onClose={closeCopilot}
            seed={seed}
            onSeedHandled={seedHandled}
          />
        </div>
      </main>
    </div>
  );
}

function EmptyWorkspace({
  notice,
  onDismiss,
}: {
  notice: string | null;
  onDismiss: () => void;
}) {
  return (
    <div className="workspace">
      <header className="workspace-topbar">
        <div className="container workspace-topbar__inner">
          <Logo />
          <Link className="button button--primary button--small" href="/create">
            Plan a celebration
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </header>
      <main id="main" className="container empty-plan">
        {notice && (
          <div className="workspace-notice" role="status">
            <Icon name="info" size={17} />
            <p>{notice}</p>
            <button type="button" className="icon-button" onClick={onDismiss} aria-label="Dismiss message">
              <Icon name="close" size={15} />
            </button>
          </div>
        )}
        <div className="empty-plan__visual" aria-hidden="true">
          <span className="empty-plan__sun" />
          <span className="empty-plan__arch" />
          <span className="empty-plan__line" />
          <span className="empty-plan__dot empty-plan__dot--one" />
          <span className="empty-plan__dot empty-plan__dot--two" />
        </div>
        <p className="eyebrow">No plan open yet</p>
        <h1 className="display">
          A plan starts with a few <em>honest details.</em>
        </h1>
        <p className="empty-plan__lede">
          Tell Morrow about the occasion, the people, the budget, and what matters most.
          You will get a grounded plan you can use today — no account required.
        </p>
        <div className="empty-plan__actions">
          <Link className="button button--primary" href="/create">
            Start planning
            <Icon name="arrow-right" size={18} />
          </Link>
          <Link className="button button--text" href="/plan?demo=1">
            Explore a sample plan
            <Icon name="arrow-up-right" size={16} />
          </Link>
        </div>
        <div className="empty-features">
          <div>
            <Icon name="wallet" size={22} />
            <strong>A budget with reasons</strong>
            <p>Priorities, guest count, location, and season change the split.</p>
          </div>
          <div>
            <Icon name="calendar" size={22} />
            <strong>A timeline that fits</strong>
            <p>Milestones work backwards from the date, even on a short runway.</p>
          </div>
          <div>
            <Icon name="sparkles" size={22} />
            <strong>Vela, grounded</strong>
            <p>Creative direction and answers built from your plan, not generic advice.</p>
          </div>
        </div>
        <p className="empty-plan__note">
          <Icon name="shield" size={15} />
          Plans and progress stay in this browser. No account, no payment details.
        </p>
      </main>
    </div>
  );
}
