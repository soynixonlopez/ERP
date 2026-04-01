import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logRateLimiterUnavailable } from "@/lib/logging/server-log";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

function buildLimiter(limit: number, window: `${number} s` | `${number} m` | `${number} h`) {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window)
  });
}

export const authRateLimit = buildLimiter(15, "1 m");
export const checkoutRateLimit = buildLimiter(20, "1 m");
export const checkinGateRateLimit = buildLimiter(90, "1 m");
export const webhookRateLimit = buildLimiter(120, "1 m");

export async function enforceRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) {
    return { success: true, remaining: 9999 };
  }

  try {
    const result = await limiter.limit(key);
    return { success: result.success, remaining: result.remaining };
  } catch {
    logRateLimiterUnavailable();
    return { success: true, remaining: 9999 };
  }
}
