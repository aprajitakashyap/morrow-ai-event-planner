import { z } from "zod";

import {
  CURRENCIES,
  EVENT_TYPES,
  PRIORITY_OPTIONS,
  SETTINGS,
  type EventBrief,
} from "@/lib/types";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Use a valid date.")
  .refine((value) => value >= new Date().toISOString().slice(0, 10), "Choose a date in the future.");

const cleanText = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? "This field is required." : "This field is too short.")
    .max(max, `Keep this under ${max} characters.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .default("");

export const briefSchema = z
  .object({
    eventType: z.enum(EVENT_TYPES),
    eventName: cleanText(80, 2),
    date: dateString,
    location: cleanText(100, 2),
    guestCount: z
      .number()
      .int("Guest count must be a whole number.")
      .min(1, "Add at least one guest.")
      .max(5000, "For this planner, keep the guest list under 5,000."),
    budget: z
      .number()
      .int("Budget must be a whole number.")
      .min(1000, "Add a budget of at least 1,000.")
      .max(100_000_000, "That budget is outside this planner's range."),
    currency: z.enum(CURRENCIES),
    style: cleanText(60, 2),
    priorities: z
      .array(z.string().max(40))
      .min(1, "Choose at least one priority.")
      .max(3, "Choose up to three priorities."),
    setting: z.enum(SETTINGS),
    accessibility: optionalText(300),
    dietary: optionalText(240),
    notes: optionalText(600),
  })
  .superRefine((brief, ctx) => {
    const validPriorities = new Set(
      PRIORITY_OPTIONS[brief.eventType].map((priority) => priority.id),
    );

    for (const priority of brief.priorities) {
      if (!validPriorities.has(priority)) {
        ctx.addIssue({
          code: "custom",
          path: ["priorities"],
          message: "One of those priorities is not available for this event type.",
        });
        break;
      }
    }

    if (new Set(brief.priorities).size !== brief.priorities.length) {
      ctx.addIssue({
        code: "custom",
        path: ["priorities"],
        message: "Choose each priority only once.",
      });
    }
  });

export const budgetCategorySchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  description: z.string().max(240),
  amount: z.number().nonnegative(),
  share: z.number().min(0).max(1),
  priority: z.boolean(),
  tip: z.string().max(300),
});

export const budgetSummarySchema = z.object({
  total: z.number().nonnegative(),
  currency: z.enum(CURRENCIES),
  perGuest: z.number().nonnegative(),
  health: z.enum(["roomy", "balanced", "tight", "stretch"]),
  healthLabel: z.string().max(40),
  healthSummary: z.string().max(400),
  categories: z.array(budgetCategorySchema).max(20),
  targetPerGuest: z.number().nonnegative(),
});

export const timelineTaskSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(100),
  description: z.string().max(300),
  dueDate: z.string(),
  phase: z.string().max(60),
  category: z.string().max(40),
  critical: z.boolean(),
  compressed: z.boolean(),
});

export const vendorSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  description: z.string().max(300),
  category: z.string().max(40),
  estimatedCost: z.number().nonnegative(),
  dueDate: z.string(),
  priority: z.enum(["high", "normal"]),
});

export const ideaSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  category: z.string().max(40),
  costLevel: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string().max(40)).max(10),
});

export const creativeDirectionSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  source: z.enum(["ai", "guided"]),
  palette: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).length(3),
  paletteNames: z.array(z.string().max(30)).length(3),
});

export const planInsightSchema = z.object({
  id: z.string().min(1).max(80),
  tone: z.enum(["positive", "notice", "warning"]),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(400),
});

export const nextActionSchema = z.object({
  title: z.string().min(1).max(120),
  detail: z.string().min(1).max(300),
  taskId: z.string().min(1).max(80),
});

export const planSchema = z.object({
  version: z.literal(1),
  createdAt: z.string().datetime(),
  brief: briefSchema,
  headline: z.string().min(1).max(200),
  concept: creativeDirectionSchema,
  budget: budgetSummarySchema,
  timeline: z.array(timelineTaskSchema).max(40),
  vendors: z.array(vendorSchema).max(30),
  ideas: z.array(ideaSchema).max(20),
  insights: z.array(planInsightSchema).max(20),
  nextActions: z.array(nextActionSchema).max(10),
  source: z.enum(["ai", "guided"]),
});

export const savedPlanSchema = z.object({
  version: z.literal(1),
  plan: planSchema,
  completedTaskIds: z.array(z.string().max(80)).max(100),
  vendorStatuses: z.record(
    z.string().max(80),
    z.enum(["not-started", "shortlisted", "booked"]),
  ),
  savedIdeaIds: z.array(z.string().max(80)).max(100),
  updatedAt: z.string().datetime(),
});

export const copilotSnapshotSchema = z.object({
  eventName: z.string().max(80),
  eventType: z.enum(EVENT_TYPES),
  date: z.string(),
  location: z.string().max(100),
  guestCount: z.number().int().min(1).max(5000),
  budgetTotal: z.number().nonnegative(),
  currency: z.enum(CURRENCIES),
  perGuest: z.number().nonnegative(),
  healthLabel: z.string().max(40),
  topCategories: z
    .array(
      z.object({
        label: z.string().max(80),
        amount: z.number().nonnegative(),
      }),
    )
    .max(4),
  nextTasks: z
    .array(
      z.object({
        title: z.string().max(100),
        dueDate: z.string(),
        critical: z.boolean(),
      }),
    )
    .max(5),
  vendors: z
    .array(
      z.object({
        name: z.string().max(80),
        status: z.enum(["not-started", "shortlisted", "booked"]),
        estimatedCost: z.number().nonnegative(),
      }),
    )
    .max(12),
  priorities: z.array(z.string().max(40)).max(3),
  accessibility: z.string().max(300),
  dietary: z.string().max(240),
  ideas: z
    .array(
      z.object({
        title: z.string().max(100),
        description: z.string().max(300),
      }),
    )
    .max(4),
});

export const copilotRequestSchema = z.object({
  message: cleanText(1000, 1),
  snapshot: copilotSnapshotSchema,
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1600),
      }),
    )
    .max(8)
    .default([]),
});

export const aiCreativeSchema = z.object({
  conceptTitle: z.string().trim().min(3).max(100),
  conceptBody: z.string().trim().min(20).max(500),
  ideas: z
    .array(
      z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(20).max(300),
        category: z.string().trim().min(2).max(40),
        costLevel: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(4)
    .max(6),
});

export type CopilotRequest = z.infer<typeof copilotRequestSchema>;
export type CopilotSnapshot = z.infer<typeof copilotSnapshotSchema>;
export type AiCreativeResponse = z.infer<typeof aiCreativeSchema>;

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the details and try again.";
}

export type BriefParseResult =
  | { success: true; data: EventBrief }
  | { success: false; error: string };

export function parseBrief(input: unknown): BriefParseResult {
  const result = briefSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: firstIssue(result.error) };
  }
  return { success: true, data: result.data };
}
