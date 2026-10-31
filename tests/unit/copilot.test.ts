import { describe, expect, it } from "vitest";

import { guidedCopilotReply } from "@/lib/copilot";
import type { CopilotSnapshot } from "@/lib/schemas";

function snapshot(overrides: Partial<CopilotSnapshot> = {}): CopilotSnapshot {
  return {
    eventName: "Aarti & Dev",
    eventType: "wedding",
    date: "2026-11-14",
    location: "Pune",
    guestCount: 120,
    budgetTotal: 1_500_000,
    currency: "INR",
    perGuest: 12_500,
    healthLabel: "Balanced",
    topCategories: [
      { label: "Catering", amount: 450_000 },
      { label: "Venue", amount: 300_000 },
      { label: "Photography", amount: 180_000 },
    ],
    nextTasks: [
      { title: "Book the venue", dueDate: "2026-03-01", critical: true },
      { title: "Shortlist caterers", dueDate: "2026-04-01", critical: false },
    ],
    vendors: [
      { name: "The Courtyard", status: "booked", estimatedCost: 300_000 },
      { name: "Saffron Table", status: "shortlisted", estimatedCost: 450_000 },
    ],
    priorities: ["food", "photography"],
    accessibility: "",
    dietary: "",
    ideas: [
      { title: "Welcome sherbet", description: "A cooled drink at the gate." },
      { title: "Polaroid table", description: "One photo per guest, kept as a favour." },
    ],
    ...overrides,
  };
}

describe("guided copilot", () => {
  it("routes budget questions to the money answer", () => {
    const reply = guidedCopilotReply("How can we save on cost?", snapshot());

    expect(reply).toContain("biggest lines are");
    expect(reply).toContain("Catering");
    expect(reply).toContain("guest list");
  });

  it("adjusts the budget tone to the health label", () => {
    const tight = guidedCopilotReply("What is our budget?", snapshot({ healthLabel: "Tight" }));
    const roomy = guidedCopilotReply("What is our budget?", snapshot({ healthLabel: "Roomy" }));

    expect(tight).toContain("needs a decision");
    expect(roomy).toContain("room to choose");
  });

  it("routes vendor questions and names the next unbooked vendor", () => {
    const reply = guidedCopilotReply("Which vendor should I book next?", snapshot());

    expect(reply).toContain("1 of 2 vendors are booked");
    expect(reply).toContain("Saffron Table");
    expect(reply).toContain("written quote");
  });

  it("congratulates a fully booked vendor list", () => {
    const reply = guidedCopilotReply(
      "Any contracts left?",
      snapshot({
        vendors: [
          { name: "The Courtyard", status: "booked", estimatedCost: 300_000 },
          { name: "Saffron Table", status: "booked", estimatedCost: 450_000 },
        ],
      }),
    );

    expect(reply).toContain("Every vendor in the plan is marked booked");
  });

  it("routes creative questions to saved ideas", () => {
    const reply = guidedCopilotReply("Any personal touch ideas?", snapshot());

    expect(reply).toContain("Welcome sherbet");
    expect(reply).toContain("Polaroid table");
  });

  it("has a fallback when no ideas exist", () => {
    const reply = guidedCopilotReply("Give me a theme idea", snapshot({ ideas: [] }));

    expect(reply).toContain("Choose one moment people will remember");
  });

  it("routes timeline questions to the next tasks", () => {
    const reply = guidedCopilotReply("What should I start first?", snapshot());

    expect(reply).toContain("Book the venue");
    expect(reply).toContain("(critical)");
  });

  it("handles an empty timeline", () => {
    const reply = guidedCopilotReply("What is due next?", snapshot({ nextTasks: [] }));

    expect(reply).toContain("Nothing urgent is left");
  });

  it("routes guest questions to the per-guest maths", () => {
    const reply = guidedCopilotReply("Should we invite more guests?", snapshot());

    expect(reply).toContain("120 guests");
    expect(reply).toContain("must-have and lovely-to-have");
  });

  it("reflects flagged access and dietary needs", () => {
    const reply = guidedCopilotReply(
      "How do we handle accessibility and allergies?",
      snapshot({ accessibility: "Step-free access", dietary: "Nut allergy" }),
    );

    expect(reply).toContain("Step-free access");
    expect(reply).toContain("allergies");
  });

  it("offers general inclusion advice when nothing is flagged", () => {
    const reply = guidedCopilotReply("Is the event inclusive?", snapshot());

    expect(reply).toContain("step-free routes");
  });

  it("answers stress with a single next step", () => {
    const reply = guidedCopilotReply("I feel overwhelmed and behind", snapshot());

    expect(reply).toContain("Book the venue");
    expect(reply).toContain("not a test of how tired you can get");
  });

  it("returns a useful orientation for an unrecognised question", () => {
    const reply = guidedCopilotReply("Hello there", snapshot());

    expect(reply).toContain("Aarti & Dev");
    expect(reply).toContain("120 guests");
    expect(reply).toContain("money, vendors, the timeline");
  });

  it("is deterministic for the same input", () => {
    expect(guidedCopilotReply("budget help", snapshot())).toBe(
      guidedCopilotReply("budget help", snapshot()),
    );
  });
});
