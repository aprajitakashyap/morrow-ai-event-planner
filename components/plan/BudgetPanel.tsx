"use client";

import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/dates";
import type { Plan } from "@/lib/types";

export function BudgetPanel({ plan }: { plan: Plan }) {
  const { budget } = plan;
  const largest = [...budget.categories].sort((a, b) => b.amount - a.amount)[0];
  const prioritySpend = budget.categories
    .filter((category) => category.priority)
    .reduce((sum, category) => sum + category.amount, 0);
  const contingency = budget.categories.find((category) => category.id === "contingency");

  return (
    <div className="panel-stack">
      <section className="panel-card budget-hero" aria-labelledby="budget-title">
        <div className="budget-hero__top">
          <div>
            <p className="eyebrow">The money, made legible</p>
            <h2 className="display" id="budget-title">
              {formatCurrency(budget.total, budget.currency)}
            </h2>
            <p className="budget-hero__sub">
              {formatCurrency(budget.perGuest, budget.currency)} per guest ·{" "}
              {plan.brief.guestCount} guests · {plan.brief.currency}
            </p>
          </div>
          <span className={`health-pill health-pill--${budget.health}`}>
            {budget.healthLabel}
          </span>
        </div>

        <div className="budget-hero__grid">
          <div>
            <span className="metric-label">Local benchmark</span>
            <strong>{formatCurrency(budget.targetPerGuest, budget.currency)}</strong>
            <small>per guest, before priorities</small>
          </div>
          <div>
            <span className="metric-label">Largest line</span>
            <strong>{largest ? largest.label : "—"}</strong>
            <small>
              {largest
                ? `${formatCurrency(largest.amount, budget.currency)} · ${Math.round(
                    largest.share * 100,
                  )}%`
                : "No categories yet"}
            </small>
          </div>
          <div>
            <span className="metric-label">Priority spend</span>
            <strong>{formatCurrency(prioritySpend, budget.currency)}</strong>
            <small>{Math.round((prioritySpend / Math.max(1, budget.total)) * 100)}% of budget</small>
          </div>
          <div>
            <span className="metric-label">Contingency</span>
            <strong>
              {contingency ? formatCurrency(contingency.amount, budget.currency) : "—"}
            </strong>
            <small>protect this until final invoices</small>
          </div>
        </div>

        <div className={`callout callout--${budget.health === "roomy" ? "positive" : budget.health === "balanced" ? "notice" : "warning"}`}>
          <Icon
            name={budget.health === "roomy" ? "check-circle" : "info"}
            size={17}
          />
          <p>{budget.healthSummary}</p>
        </div>
      </section>

      <section aria-labelledby="allocation-title">
        <header className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">Every line has a reason</p>
            <h2 id="allocation-title">Where the money goes</h2>
          </div>
          <p className="section-intro">
            Priorities and guest count reweight the split. Amounts always add up to the total.
          </p>
        </header>

        <div className="budget-lines">
          {budget.categories.map((category, index) => (
            <article className="budget-line" key={category.id}>
              <div className="budget-line__head">
                <div className="budget-line__title">
                  <span className="budget-line__index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>
                      {category.label}
                      {category.priority && (
                        <span className="tag tag--accent">A priority</span>
                      )}
                    </h3>
                    <p>{category.description}</p>
                  </div>
                </div>
                <div className="budget-line__amount">
                  <strong>{formatCurrency(category.amount, budget.currency)}</strong>
                  <span>{Math.round(category.share * 100)}%</span>
                </div>
              </div>

              <progress
                className={`allocation-progress allocation-progress--${index % 5}`}
                value={category.share * 100}
                max={100}
                aria-label={`${category.label}: ${Math.round(category.share * 100)}% of budget`}
              >
                {Math.round(category.share * 100)}%
              </progress>

              <p className="budget-line__tip">
                <Icon name="info" size={14} />
                {category.tip}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card" aria-labelledby="saving-title">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">If you need to find room</p>
            <h2 id="saving-title">Three honest levers</h2>
          </div>
        </header>
        <ol className="lever-list">
          <li>
            <strong>Guest count first.</strong>
            <p>
              Ten fewer guests saves about{" "}
              {formatCurrency(budget.perGuest * 10, budget.currency)} at your current
              per-guest rate, before venue minimums change.
            </p>
          </li>
          <li>
            <strong>Then the date.</strong>
            <p>
              A weekday or off-peak date can lower venue and vendor pricing without
              changing the atmosphere you are planning.
            </p>
          </li>
          <li>
            <strong>Protect the things people remember.</strong>
            <p>
              Trim stationery, favours, or a second outfit before cutting food,
              photography, or access support.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
