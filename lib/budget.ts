import { daysBetween, formatCurrency, parseISODate, todayISO } from "@/lib/dates";
import {
  ALLOCATIONS,
  PRIORITY_BOOSTS,
  type AllocationDefinition,
} from "@/lib/plan-data";
import {
  PRIORITY_OPTIONS,
  type BudgetCategory,
  type BudgetHealth,
  type BudgetSummary,
  type Currency,
  type EventBrief,
} from "@/lib/types";

const BASE_PER_GUEST: Record<EventBrief["eventType"], Record<Currency, number>> = {
  wedding: { INR: 8500, USD: 175, EUR: 160, GBP: 140 },
  birthday: { INR: 2200, USD: 70, EUR: 60, GBP: 50 },
  community: { INR: 900, USD: 35, EUR: 30, GBP: 25 },
};

const DESTINATION_MARKERS = [
  "goa",
  "udaipur",
  "bali",
  "santorini",
  "tuscany",
  "maldives",
  "jaipur",
  "phuket",
  "amalfi",
];

const PREMIUM_MARKERS = [
  "mumbai",
  "delhi",
  "bengaluru",
  "bangalore",
  "new york",
  "london",
  "san francisco",
  "singapore",
  "dubai",
  "toronto",
  "sydney",
  "paris",
  "zurich",
];

const MID_MARKERS = [
  "pune",
  "hyderabad",
  "chennai",
  "kolkata",
  "ahmedabad",
  "kochi",
  "cochin",
  "chandigarh",
  "lucknow",
  "indore",
  "nairobi",
  "cape town",
];

const HEALTH_COPY: Record<
  BudgetHealth,
  { label: string; summary: string }
> = {
  roomy: {
    label: "Roomy",
    summary:
      "There is breathing room here. Protect the buffer and spend on the parts you will remember, not the parts that photograph well for someone else.",
  },
  balanced: {
    label: "Balanced",
    summary:
      "This is a workable budget with a few smart trade-offs. Decide what is non-negotiable before you start collecting quotes.",
  },
  tight: {
    label: "Tight",
    summary:
      "The budget is stretched for the guest count. Trim the guest list, the venue, or one premium detail before the small costs add up.",
  },
  stretch: {
    label: "Needs a rethink",
    summary:
      "At this guest count, the numbers are doing too much work. Either increase the budget, shrink the list, or change the format to something simpler.",
  },
};

function locationMultiplier(location: string): {
  multiplier: number;
  label: string;
  kind: "destination" | "premium" | "mid" | "standard";
} {
  const value = location.toLowerCase();
  if (DESTINATION_MARKERS.some((marker) => value.includes(marker))) {
    return { multiplier: 1.22, label: "destination pricing", kind: "destination" };
  }
  if (PREMIUM_MARKERS.some((marker) => value.includes(marker))) {
    return { multiplier: 1.14, label: "metro pricing", kind: "premium" };
  }
  if (MID_MARKERS.some((marker) => value.includes(marker))) {
    return { multiplier: 1.04, label: "city pricing", kind: "mid" };
  }
  return { multiplier: 1, label: "local pricing", kind: "standard" };
}

export function seasonMultiplier(brief: EventBrief): {
  multiplier: number;
  label: string | null;
} {
  const month = parseISODate(brief.date).getUTCMonth();
  if (brief.eventType === "wedding" && [10, 11, 0, 1].includes(month)) {
    return { multiplier: 1.1, label: "peak wedding season" };
  }
  if (month === 11) {
    return { multiplier: 1.06, label: "December pricing" };
  }
  return { multiplier: 1, label: null };
}

export function weekdayMultiplier(brief: EventBrief): {
  multiplier: number;
  label: string | null;
} {
  const day = parseISODate(brief.date).getUTCDay();
  if (brief.eventType === "wedding" && day >= 1 && day <= 4) {
    return { multiplier: 0.92, label: "weekday wedding" };
  }
  return { multiplier: 1, label: null };
}

export function targetPerGuest(brief: EventBrief): {
  amount: number;
  multiplier: number;
  locationLabel: string;
  seasonLabel: string | null;
  weekdayLabel: string | null;
} {
  const location = locationMultiplier(brief.location);
  const season = seasonMultiplier(brief);
  const weekday = weekdayMultiplier(brief);
  const multiplier = location.multiplier * season.multiplier * weekday.multiplier;
  const base = BASE_PER_GUEST[brief.eventType][brief.currency];
  return {
    amount: Math.round(base * multiplier),
    multiplier,
    locationLabel: location.label,
    seasonLabel: season.label,
    weekdayLabel: weekday.label,
  };
}

export function healthForRatio(ratio: number): BudgetHealth {
  if (ratio >= 1.25) return "roomy";
  if (ratio >= 0.9) return "balanced";
  if (ratio >= 0.62) return "tight";
  return "stretch";
}

function adjustedWeights(brief: EventBrief): Map<string, number> {
  const weights = new Map(
    ALLOCATIONS[brief.eventType].map((category) => [category.id, category.weight]),
  );
  const boosts = PRIORITY_BOOSTS[brief.eventType];

  for (const priority of brief.priorities) {
    const boost = boosts[priority];
    if (!boost) continue;
    for (const [categoryId, amount] of Object.entries(boost)) {
      weights.set(categoryId, (weights.get(categoryId) ?? 0) + amount);
    }
  }

  if (brief.guestCount > 120) {
    const extra = Math.min(8, ((brief.guestCount - 120) / 40) * 1.2);
    weights.set("catering", (weights.get("catering") ?? 0) + extra);
    weights.set("stationery", (weights.get("stationery") ?? 0) + Math.min(2, extra / 3));
    weights.set("venue", (weights.get("venue") ?? 0) + Math.min(4, extra / 2));
  }

  if (brief.guestCount < 40) {
    weights.set("catering", Math.max(4, (weights.get("catering") ?? 0) - 2));
    weights.set("venue", Math.max(4, (weights.get("venue") ?? 0) - 1));
  }

  if (brief.setting === "outdoor") {
    weights.set("decor", (weights.get("decor") ?? 0) + 2);
    weights.set("contingency", (weights.get("contingency") ?? 0) + 2);
    weights.set("venue", Math.max(4, (weights.get("venue") ?? 0) - 2));
  }

  if (brief.setting === "indoor") {
    weights.set("contingency", (weights.get("contingency") ?? 0) + 1);
  }

  return weights;
}

function allocateAmounts(
  total: number,
  categories: AllocationDefinition[],
  weights: Map<string, number>,
): Map<string, number> {
  const weightSum = categories.reduce(
    (sum, category) => sum + Math.max(0.5, weights.get(category.id) ?? category.weight),
    0,
  );

  const exact = categories.map((category) => ({
    id: category.id,
    value:
      (total * Math.max(0.5, weights.get(category.id) ?? category.weight)) /
      weightSum,
  }));

  const allocated = new Map(
    exact.map(({ id, value }) => [id, Math.floor(value)] as const),
  );
  let remainder = total - [...allocated.values()].reduce((sum, value) => sum + value, 0);

  const byFraction = [...exact].sort(
    (a, b) => b.value - Math.floor(b.value) - (a.value - Math.floor(a.value)),
  );

  let index = 0;
  while (remainder > 0) {
    const item = byFraction[index % byFraction.length];
    allocated.set(item.id, (allocated.get(item.id) ?? 0) + 1);
    remainder -= 1;
    index += 1;
  }

  return allocated;
}

export function buildBudget(brief: EventBrief): BudgetSummary {
  const definitions = ALLOCATIONS[brief.eventType];
  const weights = adjustedWeights(brief);
  const amounts = allocateAmounts(brief.budget, definitions, weights);
  const target = targetPerGuest(brief);
  const perGuest = brief.budget / brief.guestCount;
  const ratio = perGuest / target.amount;
  const health = healthForRatio(ratio);

  const priorityCategories = new Set(
    brief.priorities
      .map((priorityId) =>
        PRIORITY_OPTIONS[brief.eventType].find((item) => item.id === priorityId),
      )
      .flatMap((priority) => (priority ? [priority.category] : [])),
  );

  const categories: BudgetCategory[] = definitions.map((definition) => {
    const amount = amounts.get(definition.id) ?? 0;
    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      amount,
      share: brief.budget === 0 ? 0 : amount / brief.budget,
      priority: priorityCategories.has(definition.id),
      tip: definition.tip,
    };
  });

  return {
    total: brief.budget,
    currency: brief.currency,
    perGuest,
    health,
    healthLabel: HEALTH_COPY[health].label,
    healthSummary: HEALTH_COPY[health].summary,
    categories,
    targetPerGuest: target.amount,
  };
}

export function budgetHeadline(brief: EventBrief, budget: BudgetSummary): string {
  const target = targetPerGuest(brief);
  const comparison =
    budget.perGuest >= target.amount
      ? `${Math.round((budget.perGuest / target.amount - 1) * 100)}% above`
      : `${Math.round((1 - budget.perGuest / target.amount) * 100)}% below`;

  return `${formatCurrency(budget.perGuest, brief.currency)} per guest — ${comparison} the ${brief.currency} benchmark for ${target.locationLabel}.`;
}

export function budgetContext(brief: EventBrief, budget: BudgetSummary): string {
  const top = [...budget.categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((category) => `${category.label} ${formatCurrency(category.amount, brief.currency)}`)
    .join(", ");
  return `${budget.healthLabel}; ${formatCurrency(budget.total, brief.currency)} total, ${formatCurrency(budget.perGuest, brief.currency)} per guest; largest lines: ${top}.`;
}

export function daysOfPlanning(brief: EventBrief, now = new Date()): number {
  return Math.max(0, daysBetween(todayISO(now), brief.date));
}

export function benchmarkFor(brief: EventBrief): number {
  return targetPerGuest(brief).amount;
}
