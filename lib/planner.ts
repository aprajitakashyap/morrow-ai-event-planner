import { buildBudget, targetPerGuest } from "@/lib/budget";
import { daysBetween, formatCurrency, formatDate, todayISO } from "@/lib/dates";
import { buildConcept, selectLocalIdeas } from "@/lib/ideas-engine";
import { buildTimeline, buildVendors } from "@/lib/timeline";
import {
  EVENT_TYPE_META,
  type EventBrief,
  type NextAction,
  type Plan,
  type PlanInsight,
} from "@/lib/types";

function buildInsights(
  brief: EventBrief,
  budget: ReturnType<typeof buildBudget>,
  now: Date,
): PlanInsight[] {
  const insights: PlanInsight[] = [];
  const target = targetPerGuest(brief);
  const days = Math.max(0, daysBetween(todayISO(now), brief.date));
  const targetText = formatCurrency(target.amount, brief.currency);

  const healthTitle: Record<typeof budget.health, string> = {
    roomy: "The budget has room to breathe",
    balanced: "A workable budget with real choices",
    tight: "This budget is tight for the guest count",
    stretch: "The numbers need a structural decision",
  };

  insights.push({
    id: "budget-health",
    tone:
      budget.health === "roomy"
        ? "positive"
        : budget.health === "balanced"
          ? "notice"
          : "warning",
    title: healthTitle[budget.health],
    body: `${budget.healthSummary} Your budget is ${formatCurrency(budget.perGuest, brief.currency)} per guest against a ${targetText} local benchmark.`,
  });

  if (target.multiplier > 1.06) {
    const drivers = [target.locationLabel, target.seasonLabel, target.weekdayLabel]
      .filter(Boolean)
      .join(" and ");
    insights.push({
      id: "benchmark",
      tone: "notice",
      title: "The date and location shift the benchmark",
      body: `We have adjusted the per-guest benchmark for ${drivers}. Collect three written quotes before treating any estimate as real.`,
    });
  }

  if (brief.guestCount >= 150) {
    const tenGuests = budget.perGuest * 10;
    insights.push({
      id: "guest-scale",
      tone: "warning",
      title: "The guest list is the biggest lever",
      body: `At ${brief.guestCount} guests, catering and venue absorb most of the plan. Every 10 guests adds roughly ${formatCurrency(tenGuests, brief.currency)} at your current per-guest rate.`,
    });
  }

  if (brief.setting === "outdoor") {
    insights.push({
      id: "weather",
      tone: "notice",
      title: "Put the wet-weather plan in writing",
      body: "Ask the venue and every outdoor vendor what happens in rain or extreme heat — including who decides, by when, and what it costs to move.",
    });
  }

  if (brief.accessibility.trim()) {
    insights.push({
      id: "access",
      tone: "notice",
      title: "Access needs belong in every brief",
      body: `You have noted: ${brief.accessibility.trim()}. Share this with the venue and the run-of-show owner, not only the guests who need it.`,
    });
  }

  if (brief.dietary.trim()) {
    insights.push({
      id: "dietary",
      tone: "notice",
      title: "Make dietary needs easy to act on",
      body: `You have noted: ${brief.dietary.trim()}. Ask for labelled food and a named person on the catering team who owns allergies.`,
    });
  }

  if (days < 30) {
    insights.push({
      id: "timeline",
      tone: "warning",
      title: "The calendar is compressed",
      body: `There are ${days} days left. Early milestones have been pulled forward and marked with the original intent. Do the starred tasks first; let the rest follow.`,
    });
  } else if (days < 90) {
    insights.push({
      id: "timeline",
      tone: "notice",
      title: "A shorter runway than it looks",
      body: `There are ${days} days left. Venue and catering availability will drive the rest of the plan, so settle those two before refining the details.`,
    });
  } else {
    insights.push({
      id: "timeline",
      tone: "positive",
      title: "The runway is on your side",
      body: `There are ${days} days left. Book the venue and the one vendor you would be saddest to lose first; everything else can wait a week.`,
    });
  }

  return insights.slice(0, 7);
}

function buildNextActions(
  timeline: ReturnType<typeof buildTimeline>,
): NextAction[] {
  return timeline
    .filter((task) => task.critical && task.phase !== "The day")
    .slice(0, 3)
    .map((task) => ({
      title: task.title,
      detail: task.description,
      taskId: task.id,
    }));
}

export function buildPlan(brief: EventBrief, now = new Date()): Plan {
  const budget = buildBudget(brief);
  const timeline = buildTimeline(brief, now);
  const vendors = buildVendors(brief, budget, now);
  const concept = buildConcept(brief);
  const meta = EVENT_TYPE_META[brief.eventType];
  const formattedDate = formatDate(brief.date);

  return {
    version: 1,
    createdAt: now.toISOString(),
    brief,
    headline: `${brief.eventName} is a ${brief.style.toLowerCase()} ${
      meta.label.toLowerCase()
    } for ${brief.guestCount} guests in ${brief.location}, on ${formattedDate}.`,
    concept,
    budget,
    timeline,
    vendors,
    ideas: selectLocalIdeas(brief),
    insights: buildInsights(brief, budget, now),
    nextActions: buildNextActions(timeline),
    source: "guided",
  };
}
