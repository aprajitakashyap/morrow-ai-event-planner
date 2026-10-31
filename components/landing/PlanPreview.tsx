import { formatCurrency, formatDate } from "@/lib/dates";
import type { Plan } from "@/lib/types";

export function PlanPreview({ plan }: { plan: Plan }) {
  const topCategories = [...plan.budget.categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  const nextAction = plan.nextActions[0];

  return (
    <div className="preview-scene" aria-label="Sample plan preview">
      <div className="preview-orbit preview-orbit--one" aria-hidden="true" />
      <div className="preview-orbit preview-orbit--two" aria-hidden="true" />
      <article className="preview-card">
        <header className="preview-card__header">
          <span className="preview-kicker">
            <span className="preview-kicker__dot" aria-hidden="true" />
            Live plan preview
          </span>
          <span className="preview-badge">Wedding</span>
        </header>

        <div className="preview-event">
          <p className="preview-date">{formatDate(plan.brief.date)}</p>
          <h2>{plan.brief.eventName}</h2>
          <p>
            {plan.brief.location} · {plan.brief.guestCount} guests
          </p>
        </div>

        <div className="preview-budget">
          <div>
            <span>Total budget</span>
            <strong>{formatCurrency(plan.budget.total, plan.budget.currency)}</strong>
          </div>
          <span className="health-pill health-pill--roomy">{plan.budget.healthLabel}</span>
        </div>

        <div className="preview-bars" aria-label="Top budget categories">
          {topCategories.map((category, index) => (
            <div className="preview-bar" key={category.id}>
              <div className="preview-bar__label">
                <span>{category.label}</span>
                <span>{Math.round(category.share * 100)}%</span>
              </div>
              <progress
                className={`allocation-progress allocation-progress--${index % 5}`}
                value={category.amount}
                max={plan.budget.total}
              >
                {Math.round(category.share * 100)}%
              </progress>
            </div>
          ))}
        </div>

        {nextAction && (
          <div className="preview-next">
            <span className="preview-next__icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <span>Next best step</span>
              <strong>{nextAction.title}</strong>
            </div>
          </div>
        )}
      </article>

      <div className="preview-chat">
        <span className="preview-chat__avatar" aria-hidden="true">
          V
        </span>
        <div>
          <span>Vela · planning copilot</span>
          <p>
            Keep the long dinner. Move 6% from stationery into the buffer and
            you still have room for a second photographer.
          </p>
        </div>
      </div>

      <div className="preview-swatch" aria-hidden="true">
        {plan.concept.palette.map((color) => (
          <svg key={color} viewBox="0 0 24 24" role="presentation">
            <rect width="24" height="24" rx="12" fill={color} />
          </svg>
        ))}
      </div>
    </div>
  );
}
