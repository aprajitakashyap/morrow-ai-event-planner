import { briefSchema, savedPlanSchema } from "@/lib/schemas";
import type { EventBrief, Plan, SavedPlan, VendorStatus } from "@/lib/types";

export const PLAN_STORAGE_KEY = "morrow.plan.v1";
export const EDIT_BRIEF_KEY = "morrow.edit-brief.v1";
export const NOTICE_KEY = "morrow.notice.v1";

export function emptySavedPlan(plan: Plan): SavedPlan {
  return {
    version: 1,
    plan,
    completedTaskIds: [],
    vendorStatuses: Object.fromEntries(
      plan.vendors.map((vendor) => [vendor.id, "not-started" satisfies VendorStatus]),
    ),
    savedIdeaIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function readSavedPlan(): SavedPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = savedPlanSchema.safeParse(JSON.parse(raw) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeSavedPlan(value: SavedPlan): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function saveNewPlan(plan: Plan): boolean {
  return writeSavedPlan(emptySavedPlan(plan));
}

export function clearSavedPlan(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PLAN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing. The in-memory plan still works.
  }
}

export function stageBriefForEditing(brief: EventBrief): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EDIT_BRIEF_KEY, JSON.stringify(brief));
  } catch {
    // Non-critical.
  }
}

export function readStagedBrief(): EventBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EDIT_BRIEF_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(EDIT_BRIEF_KEY);
    const parsed = briefSchema.safeParse(JSON.parse(raw) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function setTransientNotice(message: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(NOTICE_KEY, message);
  } catch {
    // Non-critical.
  }
}

export function takeTransientNotice(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const message = window.sessionStorage.getItem(NOTICE_KEY);
    if (message) window.sessionStorage.removeItem(NOTICE_KEY);
    return message;
  } catch {
    return null;
  }
}
