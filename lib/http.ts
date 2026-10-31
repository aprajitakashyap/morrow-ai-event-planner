export type JsonError = {
  error: string;
};

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function jsonError(
  message: string,
  status: number,
  headers?: HeadersInit,
): Response {
  return jsonResponse({ error: message } satisfies JsonError, {
    status,
    headers,
  });
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "local";
}

export async function readJsonBody(
  request: Request,
  maxBytes = 32_768,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: jsonError("Send this request as JSON.", 415),
    };
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return {
      ok: false,
      response: jsonError("That request is too large.", 413),
    };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      ok: false,
      response: jsonError("That request is too large.", 413),
    };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonError("That JSON could not be read.", 400),
    };
  }
}
