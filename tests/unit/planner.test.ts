import { describe, expect, it } from "vitest";

import { addDays, todayISO } from "@/lib/dates";
import { buildBudget } from "@/lib/budget";
import { buildPlan } from "@/lib/planner";
import { planSchema } from "@/lib/schemas";
import { LOCAL_IDEAS } from "@/lib/ideas";
import type { EventType } from "@/lib/types";

const NOW = new Date();
const EVENT_TYPES: EventType[] = ["wedding", "birthday", "community"];

function briefFor(eventType: EventType) {
  return {
    eventType,
    eventName: "A test celebration",
    date: addDays(todayISO(NOW), 120),
    location: "Pune",
    guestCount: 80,
    budget: 900_000,
    currency: "INR" as const,
    style:
      eventType === "wedding"
        ? "Garden romantic"
        : eventType === "birthday"
          ? "Playful & bright"
          : "Neighbourhood gathering",
    priorities: eventType === "wedding" ? ["food"] : eventType === "birthday" ? ["food"] : ["programming"],
    setting: "mixed" as const,
    accessibility: "Step-free access",
    dietary: "One nut allergy",
    notes: "A calm, useful plan.",
  };
}

describe("plan builder", () => {
  it("returns a plan that satisfies its own schema", () => {
    const plan = buildPlan(briefFor("wedding"), NOW);
    const result = planSchema.safeParse(plan);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.source).toBe("guided");
  });

  it("builds a valid plan for every supported occasion", () => {
    for (const eventType of EVENT_TYPES) {
      const plan = buildPlan(briefFor(eventType), NOW);
      expect(planSchema.safeParse(plan).success).toBe(true);
      expect(plan.brief.eventType).toBe(eventType);
      expect(plan.ideas.length).toBe(6);
      expect(plan.concept.palette).toHaveLength(3);
      expect(plan.concept.paletteNames).toHaveLength(3);
      expect(plan.timeline.length).toBeGreaterThan(0);
    }
  });

  it("keeps the budget total aligned with the brief", () => {
    const input = briefFor("wedding");
    const plan = buildPlan(input, NOW);

    expect(plan.budget.total).toBe(input.budget);
    expect(plan.budget.categories.reduce((sum, category) => sum + category.amount, 0)).toBe(
      input.budget,
    );
    expect(plan.budget).toEqual(buildBudget(input));
  });

  it("returns at most three next actions and only critical milestones", () => {
    const plan = buildPlan(briefFor("wedding"), NOW);
    const criticalIds = new Set(
      plan.timeline.filter((task) => task.critical).map((task) => task.id),
    );

    expect(plan.nextActions.length).toBeLessThanOrEqual(3);
    expect(plan.nextActions.every((action) => criticalIds.has(action.taskId))).toBe(true);
  });

  it("selects ideas that belong to the requested occasion", () => {
    const plan = buildPlan(briefFor("community"), NOW);
    const communityTitles = new Set(
      LOCAL_IDEAS.filter((idea) => idea.eventType === "community").map((idea) => idea.title),
    );

    expect(plan.ideas.every((idea) => communityTitles.has(idea.title))).toBe(true);
  });

  it("includes access and dietary notes in the plan insights", () => {
    const plan = buildPlan(briefFor("wedding"), NOW);
    const bodies = plan.insights.map((insight) => insight.body).join(" ");

    expect(bodies).toContain("Step-free access");
    expect(bodies).toContain("One nut allergy");
  });
});
