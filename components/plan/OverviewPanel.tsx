"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { daysLabel, formatCurrency, formatDate, formatShortDate } from "@/lib/dates";
import {
  EVENT_TYPE_META,
  type Plan,
  type PlanInsight,
  type SavedPlan,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import type { WorkspaceTab } from "@/components/plan/types";

type OverviewPanelProps = {
  plan: Plan;
  state: SavedPlan;
  days: number;
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: WorkspaceTab) => void;
};

const TONE_ICON: Record<PlanInsight["tone"], IconName> = {
  positive: "check-circle",
  notice: "info",
  warning: "alert",
};

export function OverviewPanel({
  plan,
  state,
  days,
  onToggleTask,
  onNavigate,
}: OverviewPanelProps) {
  const completed = new Set(state.completedTaskIds);
  const completedCount = plan.timeline.filter((task) => completed.has(task.id)).length;
  const progress =
    plan.timeline.length === 0 ? 0 : Math.round((completedCount / plan.timeline.length) * 100);
  const topCategories = [...plan.budget.categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  const booked = plan.vendors.filter(
    (vendor) => state.vendorStatuses[vendor.id] === "booked",
  ).length;
  const shortlisted = plan.vendors.filter(
    (vendor) => state.vendorStatuses[vendor.id] === "shortlisted",
  ).length;
  const nextActions = plan.nextActions.filter((action) => !completed.has(action.taskId));
  const remainingTask = plan.timeline.find((task) => !completed.has(task.id));

  return (
    <div className="panel-stack">
      <section className="overview-lead" aria-labelledby="concept-title">
        <div className="overview-lead__copy">
          <div className="card-kicker">
            <span className="status-dot" aria-hidden="true" />
            Creative direction
            <span className="source-pill">
              {plan.concept.source === "ai" ? "Vela · AI" : "Vela · guided"}
            </span>
          </div>
          <h2 className="display" id="concept-title">
            {plan.concept.title}
          </h2>
          <p className="overview-lead__body">{plan.concept.body}</p>
          <div className="palette" aria-label="Suggested palette">
            {plan.concept.palette.map((color, index) => (
              <div className="palette__item" key={color}>
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <rect width="48" height="48" rx="14" fill={color} />
                </svg>
                <span>{plan.concept.paletteNames[index] ?? color}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="overview-lead__aside">
          <p className="eyebrow">The occasion</p>
          <strong className="overview-type">{EVENT_TYPE_META[plan.brief.eventType].label}</strong>
          <dl className="fact-list">
            <div>
              <dt>Date</dt>
              <dd>{formatDate(plan.brief.date)}</dd>
            </div>
            <div>
              <dt>Countdown</dt>
              <dd>{daysLabel(days)}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{plan.brief.location}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{plan.brief.guestCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="stat-strip" aria-label="Plan at a glance">
        <div className="stat">
          <span>Budget</span>
          <strong>{formatCurrency(plan.budget.total, plan.budget.currency)}</strong>
          <small>{formatCurrency(plan.budget.perGuest, plan.budget.currency)} per guest</small>
        </div>
        <div className="stat">
          <span>Budget health</span>
          <strong>{plan.budget.healthLabel}</strong>
          <small>Benchmark {formatCurrency(plan.budget.targetPerGuest, plan.budget.currency)}</small>
        </div>
        <div className="stat">
          <span>Milestones</span>
          <strong>
            {completedCount}/{plan.timeline.length}
          </strong>
          <small>{progress}% complete</small>
        </div>
        <div className="stat">
          <span>Vendors</span>
          <strong>
            {booked}/{plan.vendors.length}
          </strong>
          <small>{shortlisted} shortlisted</small>
        </div>
      </section>

      <div className="overview-columns">
        <section className="panel-card" aria-labelledby="next-steps-title">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">Keep moving</p>
              <h2 id="next-steps-title">Next best steps</h2>
            </div>
            <span className="panel-card__meta">{progress}% complete</span>
          </header>

          <div className="progress-track">
            <progress
              className="progress-track__bar"
              value={progress}
              max={100}
              aria-label={`${progress}% of milestones complete`}
            >
              {progress}%
            </progress>
          </div>

          {nextActions.length > 0 ? (
            <ul className="action-list">
              {nextActions.map((action, index) => (
                <li key={action.taskId}>
                  <button
                    type="button"
                    className="action-check"
                    onClick={() => onToggleTask(action.taskId)}
                    aria-label={`Mark “${action.title}” as complete`}
                  >
                    <span aria-hidden="true" />
                  </button>
                  <div>
                    <span className="action-list__index">0{index + 1}</span>
                    <strong>{action.title}</strong>
                    <p>{action.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="inline-empty">
              <Icon name="check-circle" size={22} />
              <div>
                <strong>Every suggested next step is done.</strong>
                <p>
                  {remainingTask
                    ? `The next milestone still open is “${remainingTask.title}”.`
                    : "Move to final confirmations, payments, and the run of show."}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="text-link"
            onClick={() => onNavigate("timeline")}
          >
            Open the full timeline
            <Icon name="arrow-right" size={15} />
          </button>
        </section>

        <section className="panel-card" aria-labelledby="budget-snapshot-title">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">The money</p>
              <h2 id="budget-snapshot-title">Budget at a glance</h2>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => onNavigate("budget")}
            >
              Details
              <Icon name="arrow-right" size={15} />
            </button>
          </header>

          <div className="budget-total">
            <strong>{formatCurrency(plan.budget.total, plan.budget.currency)}</strong>
            <span className={`health-pill health-pill--${plan.budget.health}`}>
              {plan.budget.healthLabel}
            </span>
          </div>
          <p className="budget-compare">
            {formatCurrency(plan.budget.perGuest, plan.budget.currency)} per guest against a{" "}
            {formatCurrency(plan.budget.targetPerGuest, plan.budget.currency)} benchmark.
          </p>

          <div className="mini-bars" aria-label="Largest budget categories">
            {topCategories.map((category, index) => (
              <div className="mini-bar" key={category.id}>
                <div className="mini-bar__label">
                  <span>{category.label}</span>
                  <span>{formatCurrency(category.amount, plan.budget.currency, { compact: true })}</span>
                </div>
                <progress
                  className={`allocation-progress allocation-progress--${index % 5}`}
                  value={category.share * 100}
                  max={100}
                >
                  {Math.round(category.share * 100)}%
                </progress>
              </div>
            ))}
          </div>

          <div className="callout callout--soft">
            <Icon name="info" size={17} />
            <p>{plan.budget.healthSummary}</p>
          </div>
        </section>
      </div>

      <div className="overview-columns overview-columns--even">
        <section className="panel-card" aria-labelledby="insights-title">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">What the plan notices</p>
              <h2 id="insights-title">Worth your attention</h2>
            </div>
          </header>
          <ul className="insight-list">
            {plan.insights.slice(0, 4).map((insight) => (
              <li key={insight.id} className={cn("insight", `insight--${insight.tone}`)}>
                <span className="insight__icon">
                  <Icon name={TONE_ICON[insight.tone]} size={17} />
                </span>
                <div>
                  <strong>{insight.title}</strong>
                  <p>{insight.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-card" aria-labelledby="care-title">
          <header className="panel-card__header">
            <div>
              <p className="eyebrow">Care is a planning input</p>
              <h2 id="care-title">Access, food & people</h2>
            </div>
          </header>
          <div className="care-list">
            <div>
              <span className="care-list__label">Access needs</span>
              <p>
                {plan.brief.accessibility ||
                  "No access needs noted yet. Ask about step-free routes, quiet space, seating, and accessible toilets before you book."}
              </p>
            </div>
            <div>
              <span className="care-list__label">Dietary needs</span>
              <p>
                {plan.brief.dietary ||
                  "No dietary needs noted yet. Confirm allergens and labelling in writing with the caterer."}
              </p>
            </div>
            {plan.brief.notes && (
              <div>
                <span className="care-list__label">Your note</span>
                <p>{plan.brief.notes}</p>
              </div>
            )}
          </div>
          <div className="care-footer">
            <span>
              <Icon name="calendar" size={15} />
              {plan.timeline.length} milestones
            </span>
            <span>
              <Icon name="bookmark" size={15} />
              {state.savedIdeaIds.length} ideas saved
            </span>
            <span>
              <Icon name="users" size={15} />
              {plan.vendors.length} vendor briefs
            </span>
          </div>
          <p className="care-next">
            Next date to protect:{" "}
            <strong>
              {formatShortDate(
                plan.timeline.find((task) => !completed.has(task.id))?.dueDate ??
                  plan.brief.date,
              )}
            </strong>
          </p>
        </section>
      </div>
    </div>
  );
}
