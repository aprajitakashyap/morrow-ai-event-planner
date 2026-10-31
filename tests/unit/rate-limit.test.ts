import { afterEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimits } from "@/lib/rate-limit";

afterEach(() => {
  resetRateLimits();
});

describe("rate limiting", () => {
  it("allows requests up to the limit and reports the remainder", () => {
    const now = 1_000_000;

    expect(checkRateLimit("visitor", 3, 60_000, now)).toEqual({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    });
    expect(checkRateLimit("visitor", 3, 60_000, now).remaining).toBe(1);
    expect(checkRateLimit("visitor", 3, 60_000, now).remaining).toBe(0);
  });

  it("blocks once the limit is reached", () => {
    const now = 1_000_000;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      checkRateLimit("visitor", 3, 60_000, now);
    }

    const blocked = checkRateLimit("visitor", 3, 60_000, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("keeps separate buckets per key", () => {
    const now = 1_000_000;
    checkRateLimit("first", 1, 60_000, now);
    checkRateLimit("first", 1, 60_000, now);

    expect(checkRateLimit("first", 1, 60_000, now).allowed).toBe(false);
    expect(checkRateLimit("second", 1, 60_000, now).allowed).toBe(true);
  });

  it("frees capacity as the window slides forward", () => {
    const start = 1_000_000;
    const window = 60_000;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      checkRateLimit("visitor", 3, window, start);
    }
    expect(checkRateLimit("visitor", 3, window, start).allowed).toBe(false);

    const later = start + window + 1;
    expect(checkRateLimit("visitor", 3, window, later).allowed).toBe(true);
  });

  it("reports the seconds until the oldest request expires", () => {
    const start = 1_000_000;
    const window = 60_000;

    checkRateLimit("visitor", 2, window, start);
    checkRateLimit("visitor", 2, window, start + 5_000);

    const blocked = checkRateLimit("visitor", 2, window, start + 20_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(40);
  });

  it("clears all state when reset", () => {
    const now = 1_000_000;
    checkRateLimit("visitor", 1, 60_000, now);
    expect(checkRateLimit("visitor", 1, 60_000, now).allowed).toBe(false);

    resetRateLimits();

    expect(checkRateLimit("visitor", 1, 60_000, now).allowed).toBe(true);
    expect(checkRateLimit("visitor", 1, 60_000, now).allowed).toBe(false);
  });
});
