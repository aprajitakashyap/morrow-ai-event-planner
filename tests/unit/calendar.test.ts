import { describe, expect, it } from "vitest";

import { buildCalendarFile } from "@/lib/calendar";
import { buildPlan } from "@/lib/planner";
import { addDays, todayISO } from "@/lib/dates";
import type { EventBrief, Plan } from "@/lib/types";

const NOW = new Date("2026-01-05T12:00:00Z");

function makePlan(overrides: Partial<EventBrief> = {}): Plan {
  const brief: EventBrief = {
    eventType: "wedding",
    eventName: "Aarti & Dev",
    date: addDays(todayISO(NOW), 150),
    location: "Pune",
    guestCount: 100,
    budget: 1_200_000,
    currency: "INR",
    style: "Garden romantic",
    priorities: ["food"],
    setting: "outdoor",
    accessibility: "",
    dietary: "",
    notes: "",
    ...overrides,
  };
  return buildPlan(brief, NOW);
}

function unfold(content: string): string[] {
  return content.replace(/\r\n /g, "").split("\r\n");
}

describe("calendar export", () => {
  it("wraps the calendar in a valid VCALENDAR envelope", () => {
    const file = buildCalendarFile(makePlan());
    const lines = unfold(file);

    expect(file.endsWith("\r\n")).toBe(true);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines[1]).toBe("VERSION:2.0");
    expect(lines).toContain("CALSCALE:GREGORIAN");
    expect(lines).toContain("END:VCALENDAR");
    expect(file.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("creates one event per timeline task", () => {
    const plan = makePlan();
    const lines = unfold(buildCalendarFile(plan));

    const events = lines.filter((line) => line === "BEGIN:VEVENT").length;
    expect(events).toBe(plan.timeline.length);

    const uids = lines.filter((line) => line.startsWith("UID:"));
    expect(uids).toHaveLength(plan.timeline.length);
    expect(new Set(uids).size).toBe(uids.length);
  });

  it("uses all-day dates with an exclusive end date", () => {
    const plan = makePlan();
    const lines = unfold(buildCalendarFile(plan));
    const task = plan.timeline[0];
    const compact = task.dueDate.replace(/-/g, "");
    const next = addDays(task.dueDate, 1).replace(/-/g, "");

    expect(lines).toContain(`DTSTART;VALUE=DATE:${compact}`);
    expect(lines).toContain(`DTEND;VALUE=DATE:${next}`);
  });

  it("escapes commas, semicolons, backslashes and newlines", () => {
    const file = buildCalendarFile(
      makePlan({ eventName: "Aarti, Dev; & Co\\ Planning\nLine two" }),
    );
    const lines = unfold(file);

    expect(lines).toContain(
      "X-WR-CALNAME:Aarti\\, Dev\\; & Co\\\\ Planning\\nLine two",
    );
  });

  it("counts each event with the expected fields", () => {
    const plan = makePlan();
    const lines = unfold(buildCalendarFile(plan));

    for (const task of plan.timeline) {
      expect(lines).toContain(`UID:${task.id}@morrow.local`);
      expect(lines).toContain(`SUMMARY:${task.title.replace(/,/g, "\\,")}`);
      expect(lines).toContain(`CATEGORIES:${task.category.replace(/,/g, "\\,")}`);
    }
  });

  it("folds every physical line to 74 characters or fewer", () => {
    const plan = makePlan();
    const physical = buildCalendarFile(plan).split("\r\n");

    for (const line of physical) {
      expect(line.length).toBeLessThanOrEqual(74);
    }
  });

  it("round-trips folded long lines back to their full value", () => {
    const plan = makePlan();
    const content = buildCalendarFile(plan);
    const physical = content.split("\r\n").slice(0, -1);
    const lines = unfold(content);
    const longTask = plan.timeline.find((task) => task.description.length > 74);

    expect(physical.some((line) => line.startsWith(" "))).toBe(true);
    expect(longTask).toBeDefined();
    if (longTask) {
      expect(lines).toContain(
        `DESCRIPTION:${longTask.description
          .replace(/\\/g, "\\\\")
          .replace(/;/g, "\\;")
          .replace(/,/g, "\\,")}`,
      );
    }
  });

  it("uses the plan creation time as the event timestamp", () => {
    const plan = makePlan();
    const lines = unfold(buildCalendarFile(plan));
    const expected = plan.createdAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

    expect(lines.filter((line) => line === `DTSTAMP:${expected}`)).toHaveLength(
      plan.timeline.length,
    );
  });
});
