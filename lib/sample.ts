import { addDays, todayISO } from "@/lib/dates";
import type { EventBrief } from "@/lib/types";

export function sampleBrief(now = new Date()): EventBrief {
  return {
    eventType: "wedding",
    eventName: "Aarav & Meera",
    date: addDays(todayISO(now), 168),
    location: "Jaipur",
    guestCount: 180,
    budget: 3_500_000,
    currency: "INR",
    style: "Garden romantic",
    priorities: ["food", "photography", "decor"],
    setting: "outdoor",
    accessibility: "Step-free access for two grandparents and a quiet room for sensory breaks.",
    dietary: "Two vegetarian guests and one nut allergy.",
    notes: "A relaxed, intimate-feeling celebration with a long dinner and no formal speeches.",
  };
}
