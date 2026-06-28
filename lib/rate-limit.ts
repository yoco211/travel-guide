import { LRUCache } from "lru-cache";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 1000,
  ttl: 1000 * 60, // 1 minute stale
});

const MAX_REQUESTS = 20; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window

/**
 * Check if a request is rate-limited.
 * Returns { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  key: string
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(key);

  if (!entry || now > entry.resetAt) {
    // Start new window
    rateLimitCache.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetIn: WINDOW_MS,
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Get client IP or identifier for rate limiting
 */
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}
