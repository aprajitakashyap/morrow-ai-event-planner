"use client";

import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatShortDate, relativeDueLabel } from "@/lib/dates";
import type { Plan, SavedPlan, VendorStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type VendorsPanelProps = {
  plan: Plan;
  state: SavedPlan;
  onSetVendorStatus: (vendorId: string, status: VendorStatus) => void;
};

const STATUS_LABELS: Record<VendorStatus, string> = {
  "not-started": "Not started",
  shortlisted: "Shortlisted",
  booked: "Booked",
};

const STATUSES: VendorStatus[] = ["not-started", "shortlisted", "booked"];

export function VendorsPanel({ plan, state, onSetVendorStatus }: VendorsPanelProps) {
  const booked = plan.vendors.filter(
    (vendor) => state.vendorStatuses[vendor.id] === "booked",
  );
  const shortlisted = plan.vendors.filter(
    (vendor) => state.vendorStatuses[vendor.id] === "shortlisted",
  );
  const bookedValue = booked.reduce((sum, vendor) => sum + vendor.estimatedCost, 0);
  const totalValue = plan.vendors.reduce((sum, vendor) => sum + vendor.estimatedCost, 0);

  return (
    <div className="panel-stack">
      <section className="panel-card" aria-labelledby="vendors-title">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">Who to book, and when</p>
            <h2 className="display" id="vendors-title">
              The vendor order.
            </h2>
          </div>
        </header>
        <p className="section-intro section-intro--left">
          Costs are drawn from your budget allocation, not a separate wish list. Mark a
          vendor shortlisted once you have asked the questions; booked only when the
          deposit and terms are confirmed in writing.
        </p>

        <div className="stat-strip stat-strip--compact">
          <div className="stat">
            <span>Booked</span>
            <strong>
              {booked.length}/{plan.vendors.length}
            </strong>
            <small>{formatCurrency(bookedValue, plan.budget.currency)} committed</small>
          </div>
          <div className="stat">
            <span>Shortlisted</span>
            <strong>{shortlisted.length}</strong>
            <small>in conversation</small>
          </div>
          <div className="stat">
            <span>Still to review</span>
            <strong>{plan.vendors.length - booked.length - shortlisted.length}</strong>
            <small>start with the high-priority briefs</small>
          </div>
          <div className="stat">
            <span>Planned vendor spend</span>
            <strong>{formatCurrency(totalValue, plan.budget.currency)}</strong>
            <small>across {plan.vendors.length} briefs</small>
          </div>
        </div>
      </section>

      <div className="vendor-grid">
        {plan.vendors.map((vendor) => {
          const status = state.vendorStatuses[vendor.id] ?? "not-started";
          return (
            <article
              className={cn("vendor-card", status === "booked" && "is-booked")}
              key={vendor.id}
            >
              <header className="vendor-card__header">
                <span className="vendor-card__category">{vendor.category}</span>
                {vendor.priority === "high" && <span className="tag tag--accent">High priority</span>}
              </header>

              <h3>{vendor.name}</h3>
              <p>{vendor.description}</p>

              <dl className="vendor-card__facts">
                <div>
                  <dt>Budget</dt>
                  <dd>{formatCurrency(vendor.estimatedCost, plan.budget.currency)}</dd>
                </div>
                <div>
                  <dt>Start by</dt>
                  <dd>{formatShortDate(vendor.dueDate)}</dd>
                </div>
              </dl>
              <p className="vendor-card__due">
                <Icon name="calendar" size={14} />
                {relativeDueLabel(vendor.dueDate)}
              </p>

              <div className="status-group" role="group" aria-label={`Status for ${vendor.name}`}>
                {STATUSES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={cn("status-button", status === option && "is-active")}
                    aria-pressed={status === option}
                    onClick={() => onSetVendorStatus(vendor.id, option)}
                  >
                    {option === "booked" && <Icon name="check" size={13} />}
                    {STATUS_LABELS[option]}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <section className="panel-card" aria-labelledby="vendor-questions-title">
        <header className="panel-card__header">
          <div>
            <p className="eyebrow">Before a deposit</p>
            <h2 id="vendor-questions-title">Six questions worth asking</h2>
          </div>
        </header>
        <div className="question-grid">
          <div>
            <strong>What is the full price?</strong>
            <p>Ask for service, staffing, delivery, tax, and gratuity in one written quote.</p>
          </div>
          <div>
            <strong>What is included?</strong>
            <p>Get the hours, equipment, setup, breakdown, and deliverable list in the contract.</p>
          </div>
          <div>
            <strong>What happens if plans change?</strong>
            <p>Read the cancellation, postponement, and weather terms before paying.</p>
          </div>
          <div>
            <strong>Who owns the day-of decisions?</strong>
            <p>Name one contact and one backup, with phone numbers the venue can reach.</p>
          </div>
          <div>
            <strong>How are access and dietary needs handled?</strong>
            <p>Ask for a named person, a written process, and labelled food where relevant.</p>
          </div>
          <div>
            <strong>What do you need from us, and when?</strong>
            <p>Put the final count, run of show, and payment dates on the same calendar.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
