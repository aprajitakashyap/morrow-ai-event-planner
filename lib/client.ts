import { guidedCopilotReply } from "@/lib/copilot";
import { planSchema } from "@/lib/schemas";
import type { CopilotRequest, CopilotSnapshot } from "@/lib/schemas";
import type {
  ChatMessage,
  EventBrief,
  Plan,
  SavedPlan,
  VendorStatus,
} from "@/lib/types";

type ApiFailure = { error?: string };

async function readFailure(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiFailure;
    return data.error ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function requestPlan(
  brief: EventBrief,
): Promise<{ plan: Plan; fallback: boolean }> {
  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
      signal: AbortSignal.timeout(28_000),
    });

    if (!response.ok) {
      throw new Error(await readFailure(response));
    }

    const data = (await response.json()) as { plan?: unknown };
    const parsed = planSchema.safeParse(data.plan);
    if (!parsed.success) throw new Error("The plan response was incomplete.");

    return { plan: parsed.data, fallback: false };
  } catch (error) {
    if (error instanceof Error && error.message && !/fetch|network|timeout|aborted/i.test(error.message)) {
      // Validation and server errors should be shown; only transport failures
      // fall back to the local planner.
      if (!/something went wrong|incomplete/i.test(error.message)) {
        throw error;
      }
    }

    const { buildPlan } = await import("@/lib/planner");
    return { plan: buildPlan(brief), fallback: true };
  }
}

export function buildCopilotSnapshot(
  plan: Plan,
  state: SavedPlan,
): CopilotSnapshot {
  return {
    eventName: plan.brief.eventName,
    eventType: plan.brief.eventType,
    date: plan.brief.date,
    location: plan.brief.location,
    guestCount: plan.brief.guestCount,
    budgetTotal: plan.budget.total,
    currency: plan.budget.currency,
    perGuest: plan.budget.perGuest,
    healthLabel: plan.budget.healthLabel,
    topCategories: [...plan.budget.categories]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((category) => ({ label: category.label, amount: category.amount })),
    nextTasks: plan.timeline
      .filter((task) => !state.completedTaskIds.includes(task.id))
      .slice(0, 5)
      .map((task) => ({
        title: task.title,
        dueDate: task.dueDate,
        critical: task.critical,
      })),
    vendors: plan.vendors.map((vendor) => ({
      name: vendor.name,
      status: state.vendorStatuses[vendor.id] ?? ("not-started" satisfies VendorStatus),
      estimatedCost: vendor.estimatedCost,
    })),
    priorities: plan.brief.priorities,
    accessibility: plan.brief.accessibility,
    dietary: plan.brief.dietary,
    ideas: plan.ideas
      .slice(0, 3)
      .map((idea) => ({ title: idea.title, description: idea.description })),
  };
}

export async function requestCopilotReply(
  message: string,
  plan: Plan,
  state: SavedPlan,
  messages: ChatMessage[],
): Promise<{ reply: string; source: "ai" | "guided"; degraded: boolean }> {
  const snapshot = buildCopilotSnapshot(plan, state);
  const history = messages
    .filter((item) => item.content.trim().length > 0)
    .slice(-6)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 1600) }));

  const payload: CopilotRequest = { message, snapshot, history };

  try {
    const response = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(28_000),
    });

    if (!response.ok) throw new Error(await readFailure(response));
    const data = (await response.json()) as {
      reply?: unknown;
      source?: unknown;
    };

    if (typeof data.reply !== "string" || data.reply.trim().length < 2) {
      throw new Error("The copilot reply was incomplete.");
    }

    return {
      reply: data.reply.trim().slice(0, 1600),
      source: data.source === "ai" ? "ai" : "guided",
      degraded: false,
    };
  } catch {
    return {
      reply: guidedCopilotReply(message, snapshot),
      source: "guided",
      degraded: true,
    };
  }
}
