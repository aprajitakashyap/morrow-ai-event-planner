import { describe, expect, it } from "vitest";

import { addDays, todayISO } from "@/lib/dates";
import { parseBrief } from "@/lib/schemas";
import { buildPlan } from "@/lib/planner";
import { sampleBrief } from "@/lib/sample";
import { emptySavedPlan, parsePlanBackup } from "@/lib/storage";
import type { EventBrief } from "@/lib/types";

function validBrief(overrides: Partial<EventBrief> = {}) {
  return {
    ...sampleBrief(),
    date: addDays(todayISO(), 90),
    ...overrides,
  };
}

describe("brief validation", () => {
  it("accepts a complete brief", () => {
    const result = parseBrief(validBrief());
    expect(result.success).toBe(true);
  });

  it("rejects a past date", () => {
    const result = parseBrief(validBrief({ date: "2020-01-01" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/future/i);
  });

  it("rejects a missing name", () => {
    const result = parseBrief(validBrief({ eventName: " " }));
    expect(result.success).toBe(false);
  });

  it("rejects guest counts outside the supported range", () => {
    expect(parseBrief(validBrief({ guestCount: 0 })).success).toBe(false);
    expect(parseBrief(validBrief({ guestCount: 5001 })).success).toBe(false);
  });

  it("rejects priorities that belong to another occasion", () => {
    const result = parseBrief(validBrief({ eventType: "birthday", priorities: ["rings"] }));
    expect(result.success).toBe(false);
  });

  it("rejects duplicate priorities", () => {
    const result = parseBrief(validBrief({ priorities: ["food", "food"] }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/only once/i);
  });

  it("rejects more than three priorities", () => {
    const result = parseBrief(
      validBrief({ priorities: ["food", "photography", "music", "decor"] }),
    );
    expect(result.success).toBe(false);
  });

  it("bounds optional free text", () => {
    const result = parseBrief(validBrief({ notes: "x".repeat(601) }));
    expect(result.success).toBe(false);
  });

  it("strips unknown properties instead of trusting them", () => {
    const result = parseBrief({ ...validBrief(), admin: true });
    expect(result.success).toBe(true);
    if (result.success) expect("admin" in result.data).toBe(false);
  });
});

describe("plan backup import & parsing", () => {
  it("successfully parses a valid plan backup", () => {
    const saved = emptySavedPlan(buildPlan(sampleBrief()));
    const serialized = JSON.stringify(saved);
    const parsed = parsePlanBackup(serialized);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.version).toBe(1);
      expect(parsed.data.plan.brief.eventName).toBe(saved.plan.brief.eventName);
    }
  });

  it("rejects invalid JSON", () => {
    const parsed = parsePlanBackup("not-valid-json");
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error).toMatch(/could not be parsed as JSON/i);
    }
  });

  it("rejects schema violations in backup", () => {
    const parsed = parsePlanBackup(JSON.stringify({ version: 99, random: "data" }));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error).toMatch(/not a valid Morrow plan backup/i);
    }
  });
});
