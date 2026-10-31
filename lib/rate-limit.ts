type Bucket = number[];

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }

  const cutoff = now - windowMs;
  const existing = buckets.get(key) ?? [];
  const recent = existing.filter((timestamp) => timestamp > cutoff);

  if (recent.length >= limit) {
    const wait = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    buckets.set(key, recent);
    return { allowed: false, remaining: 0, retryAfterSeconds: wait };
  }

  recent.push(now);
  buckets.set(key, recent);
  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimits(): void {
  buckets.clear();
}
