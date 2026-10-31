import { getCopilotAIReply } from "@/lib/ai";
import { guidedCopilotReply } from "@/lib/copilot";
import { clientKey, jsonError, jsonResponse, readJsonBody } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { copilotRequestSchema, firstIssue } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(`copilot:${clientKey(request)}`, 24, 60_000);
  if (!limit.allowed) {
    return jsonError("The copilot needs a short pause. Try again in a minute.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  const body = await readJsonBody(request, 24_576);
  if (!body.ok) return body.response;

  const parsed = copilotRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return jsonError(firstIssue(parsed.error), 422);
  }

  const { message, snapshot, history } = parsed.data;
  const aiReply = await getCopilotAIReply(message, snapshot, history);

  return jsonResponse({
    reply: aiReply ?? guidedCopilotReply(message, snapshot),
    source: aiReply ? "ai" : "guided",
  });
}
