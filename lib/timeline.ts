import { addDays, subtractDays, todayISO } from "@/lib/dates";
import { TIMELINE_TEMPLATES } from "@/lib/timeline-data";
import { VENDOR_DEFINITIONS } from "@/lib/plan-data";
import type {
  BudgetSummary,
  EventBrief,
  TimelineTask,
  Vendor,
} from "@/lib/types";

function phaseFor(weeksBefore: number): string {
  if (weeksBefore >= 20) return "Foundation";
  if (weeksBefore >= 10) return "Book the essentials";
  if (weeksBefore >= 4) return "Shape the day";
  if (weeksBefore >= 2) return "Final stretch";
  if (weeksBefore >= 1) return "Event week";
  return "The day";
}

export function buildTimeline(brief: EventBrief, now = new Date()): TimelineTask[] {
  const today = todayISO(now);

  return TIMELINE_TEMPLATES[brief.eventType]
    .map((template, index) => {
      const ideal = subtractDays(brief.date, template.weeksBefore * 7);
      const compressed = template.weeksBefore > 0 && ideal < today;
      const dueDate = compressed
        ? addDays(today, Math.min(index, 5))
        : ideal;
      const bounded = dueDate > brief.date ? brief.date : dueDate;

      return {
        id: `task-${brief.eventType}-${template.key}`,
        title: template.title,
        description: template.description,
        dueDate: bounded,
        phase: phaseFor(template.weeksBefore),
        category: template.category,
        critical: template.critical,
        compressed,
      };
    })
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return a.title.localeCompare(b.title);
    });
}

export function buildVendors(
  brief: EventBrief,
  budget: BudgetSummary,
  now = new Date(),
): Vendor[] {
  const today = todayISO(now);
  const definitions = VENDOR_DEFINITIONS[brief.eventType];
  const categories = new Map(budget.categories.map((category) => [category.id, category]));

  return Object.entries(definitions)
    .map(([categoryId, definition]) => {
      const category = categories.get(categoryId);
      if (!category) return null;
      const ideal = subtractDays(brief.date, definition.leadWeeks * 7);
      const dueDate = ideal < today ? today : ideal;
      return {
        id: `vendor-${brief.eventType}-${categoryId}`,
        name: definition.name,
        description: definition.description,
        category: category.label,
        estimatedCost: category.amount,
        dueDate,
        priority: category.priority || category.share >= 0.15 ? "high" : "normal",
      } satisfies Vendor;
    })
    .filter((vendor): vendor is Vendor => vendor !== null)
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "high" ? -1 : 1;
      return a.dueDate.localeCompare(b.dueDate);
    });
}
