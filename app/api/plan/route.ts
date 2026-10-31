import { enrichPlanWithAI } from "@/lib/ai";
import { clientKey, jsonError, jsonResponse, readJsonBody } from "@/lib/http";
import { buildPlan } from "@/lib/planner";
import { checkRateLimit } from "@/lib/rate-limit";
import { planSchema, parseBrief } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(`plan:${clientKey(request)}`, 10, 60_000);
  if (!limit.allowed) {
    return jsonError("Too many plans at once. Try again in a minute.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = parseBrief(body.value);
  if (!parsed.success) {
    return jsonError(parsed.error, 422);
  }

  const plan = buildPlan(parsed.data);
  const enriched = await enrichPlanWithAI(plan);
  const safePlan = planSchema.safeParse(enriched);

  if (!safePlan.success) {
    console.error("[morrow] Generated plan failed its own contract.");
    return jsonError("The plan could not be built safely. Please try again.", 500);
  }

  return jsonResponse({ plan: safePlan.data });
}
