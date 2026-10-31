import { describe, expect, it } from "vitest";

import {
  buildBudget,
  healthForRatio,
  seasonMultiplier,
  targetPerGuest,
  weekdayMultiplier,
} from "@/lib/budget";
import { sampleBrief } from "@/lib/sample";
import type { EventBrief } from "@/lib/types";

function brief(overrides: Partial<EventBrief> = {}): EventBrief {
  return { ...sampleBrief(), ...overrides };
}

describe("budget engine", () => {
  it("allocates every unit of the total budget", () => {
    const input = brief({ budget: 3_500_001 });
    const budget = buildBudget(input);
    const allocated = budget.categories.reduce((sum, category) => sum + category.amount, 0);

    expect(allocated).toBe(input.budget);
    expect(budget.categories.every((category) => category.amount >= 0)).toBe(true);
  });

  it("keeps shares consistent with the line amounts", () => {
    const input = brief();
    const budget = buildBudget(input);

    for (const category of budget.categories) {
      expect(category.share).toBeCloseTo(category.amount / input.budget, 10);
    }

    expect(budget.categories.reduce((sum, category) => sum + category.share, 0)).toBeCloseTo(1, 5);
  });

  it("reweights the budget when food is a priority", () => {
    const base = buildBudget(brief({ priorities: ["photography"] }));
    const foodFirst = buildBudget(brief({ priorities: ["food"] }));

    const baseCatering = base.categories.find((category) => category.id === "catering");
    const foodCatering = foodFirst.categories.find((category) => category.id === "catering");

    expect(baseCatering).toBeDefined();
    expect(foodCatering).toBeDefined();
    expect(foodCatering!.amount).toBeGreaterThan(baseCatering!.amount);
    expect(foodCatering!.priority).toBe(true);
  });

  it("marks the contingency as protected by default", () => {
    const budget = buildBudget(brief());
    const contingency = budget.categories.find((category) => category.id === "contingency");

    expect(contingency).toBeDefined();
    expect(contingency!.amount).toBeGreaterThan(0);
  });

  it("uses the documented health thresholds", () => {
    expect(healthForRatio(1.25)).toBe("roomy");
    expect(healthForRatio(1.24)).toBe("balanced");
    expect(healthForRatio(0.9)).toBe("balanced");
    expect(healthForRatio(0.89)).toBe("tight");
    expect(healthForRatio(0.62)).toBe("tight");
    expect(healthForRatio(0.61)).toBe("stretch");
  });

  it("adjusts the benchmark for a premium location and peak season", () => {
    const input = brief({ location: "Mumbai", date: "2027-11-14", eventType: "wedding" });
    const target = targetPerGuest(input);

    expect(target.locationLabel).toBe("metro pricing");
    expect(target.seasonLabel).toBe("peak wedding season");
    expect(target.multiplier).toBeGreaterThan(1);
    expect(target.amount).toBeGreaterThan(targetPerGuest(brief({ location: "Pune" })).amount);
  });

  it("discounts a weekday wedding", () => {
    const monday = brief({ date: "2027-06-07", eventType: "wedding" });
    const saturday = brief({ date: "2027-06-05", eventType: "wedding" });

    expect(weekdayMultiplier(monday).multiplier).toBeLessThan(1);
    expect(weekdayMultiplier(saturday).multiplier).toBe(1);
    expect(seasonMultiplier(monday).multiplier).toBe(1);
  });
});
