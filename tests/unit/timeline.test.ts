import { describe, expect, it } from "vitest";

import { buildBudget } from "@/lib/budget";
import { addDays, todayISO } from "@/lib/dates";
import { buildTimeline, buildVendors } from "@/lib/timeline";
import type { EventBrief } from "@/lib/types";

const NOW = new Date("2026-01-05T12:00:00Z");
const TODAY = todayISO(NOW);

function brief(overrides: Partial<EventBrief> = {}): EventBrief {
  return {
    eventType: "wedding",
    eventName: "A test wedding",
    date: addDays(TODAY, 180),
    location: "Pune",
    guestCount: 100,
    budget: 1_000_000,
    currency: "INR",
    style: "Garden romantic",
    priorities: ["food"],
    setting: "outdoor",
    accessibility: "",
    dietary: "",
    notes: "",
    ...overrides,
  };
}

describe("buildTimeline", () => {
  it("gives every task a unique id and a known phase", () => {
    const tasks = buildTimeline(brief(), NOW);
    const ids = tasks.map((task) => task.id);

    expect(tasks.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const task of tasks) {
      expect(task.phase.length).toBeGreaterThan(0);
      expect(task.id.startsWith("task-wedding-")).toBe(true);
    }
  });

  it("returns tasks sorted by due date and then title", () => {
    const tasks = buildTimeline(brief(), NOW);

    for (let index = 1; index < tasks.length; index += 1) {
      const previous = tasks[index - 1];
      const current = tasks[index];
      expect(previous.dueDate <= current.dueDate).toBe(true);
      if (previous.dueDate === current.dueDate) {
        expect(previous.title.localeCompare(current.title)).toBeLessThanOrEqual(0);
      }
    }
  });

  it("never schedules work after the event itself", () => {
    const input = brief();
    const tasks = buildTimeline(input, NOW);

    expect(tasks.every((task) => task.dueDate <= input.date)).toBe(true);
  });

  it("compresses tasks whose ideal date has already passed", () => {
    const input = brief({ date: addDays(TODAY, 21) });
    const tasks = buildTimeline(input, NOW);

    const compressed = tasks.filter((task) => task.compressed);
    expect(compressed.length).toBeGreaterThan(0);
    expect(compressed.every((task) => task.dueDate >= TODAY)).toBe(true);
    expect(compressed.every((task) => task.dueDate <= input.date)).toBe(true);
  });

  it("does not flag early tasks as compressed when there is time", () => {
    const tasks = buildTimeline(brief({ date: addDays(TODAY, 400) }), NOW);

    expect(tasks.some((task) => task.compressed)).toBe(false);
    expect(tasks.find((task) => task.phase === "Foundation")).toBeDefined();
  });

  it("produces a different plan per occasion", () => {
    const wedding = buildTimeline(brief({ eventType: "wedding" }), NOW);
    const community = buildTimeline(brief({ eventType: "community" }), NOW);

    expect(wedding.map((task) => task.id)).not.toEqual(community.map((task) => task.id));
    expect(community.every((task) => task.id.startsWith("task-community-"))).toBe(true);
  });
});

describe("buildVendors", () => {
  it("maps budget categories to vendors and costs", () => {
    const input = brief();
    const budget = buildBudget(input);
    const vendors = buildVendors(input, budget, NOW);
    const categoryIds = new Set(budget.categories.map((category) => category.id));

    expect(vendors.length).toBeGreaterThan(0);
    for (const vendor of vendors) {
      expect(vendor.id.startsWith("vendor-wedding-")).toBe(true);
      const categoryId = vendor.id.replace("vendor-wedding-", "");
      expect(categoryIds.has(categoryId)).toBe(true);
      expect(vendor.estimatedCost).toBe(
        budget.categories.find((category) => category.id === categoryId)?.amount,
      );
    }
  });

  it("never suggests a booking deadline in the past", () => {
    const input = brief({ date: addDays(TODAY, 14) });
    const vendors = buildVendors(input, buildBudget(input), NOW);

    expect(vendors.every((vendor) => vendor.dueDate >= TODAY)).toBe(true);
  });

  it("puts high-priority vendors first", () => {
    const input = brief();
    const vendors = buildVendors(input, buildBudget(input), NOW);
    const firstNormal = vendors.findIndex((vendor) => vendor.priority === "normal");
    const lastHigh = vendors.map((vendor) => vendor.priority).lastIndexOf("high");

    if (firstNormal !== -1 && lastHigh !== -1) {
      expect(lastHigh).toBeLessThan(firstNormal);
    }
  });

  it("marks priority categories or large shares as high priority", () => {
    const input = brief({ priorities: ["food"] });
    const budget = buildBudget(input);
    const vendors = buildVendors(input, budget, NOW);
    const food = budget.categories.find((category) => category.id === "catering");

    expect(food).toBeDefined();
    expect(vendors.find((vendor) => vendor.id.endsWith("catering"))?.priority).toBe("high");
  });

  it("drops vendor definitions that have no matching budget line", () => {
    const input = brief();
    const budget = buildBudget(input);
    const trimmed = {
      ...budget,
      categories: budget.categories.filter((category) => category.id !== "photography"),
    };

    const vendors = buildVendors(input, trimmed, NOW);
    expect(vendors.some((vendor) => vendor.id.endsWith("photography"))).toBe(false);
  });
});
