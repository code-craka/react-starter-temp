/**
 * Rate Limiting Utilities using Upstash Redis
 *
 * Enterprise-grade rate limiting with Redis for distributed systems.
 * Supports per-user, per-organization, and per-endpoint limits.
 */

import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitConfig {
  key: string; // Unique identifier (userId, organizationId, etc.)
  limit: number; // Max requests allowed
  window: number; // Time window in seconds
  prefix?: string; // Optional prefix for the key
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
  retryAfter?: number; // Seconds until retry (if rate limited)
}

/**
 * Check and enforce rate limit using sliding window algorithm
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { key, limit, window, prefix = "rl" } = config;
  const redisKey = `${prefix}:${key}`;
  const now = Date.now();
  const windowStart = now - window * 1000;

  try {
    // Use Redis sorted set for sliding window
    // Remove old entries outside the window
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // Count current requests in window
    const currentCount = await redis.zcard(redisKey);

    if (currentCount >= limit) {
      // Rate limit exceeded
      const oldestEntry = await redis.zrange(redisKey, 0, 0, {
        withScores: true,
      });
      const resetTime = oldestEntry[1]
        ? (oldestEntry[1] as number) + window * 1000
        : now + window * 1000;

      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.ceil(resetTime / 1000),
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Add current request
    await redis.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on the key
    await redis.expire(redisKey, window);

    return {
      success: true,
      limit,
      remaining: limit - (currentCount + 1),
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  }
}

/**
 * Simple token bucket rate limiter (faster but less accurate)
 */
export async function checkRateLimitSimple(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { key, limit, window, prefix = "rl" } = config;
  const redisKey = `${prefix}:${key}`;
  const now = Date.now();

  try {
    // Increment counter
    const count = await redis.incr(redisKey);

    // Set expiry on first request
    if (count === 1) {
      await redis.expire(redisKey, window);
    }

    // Get TTL to calculate reset time
    const ttl = await redis.ttl(redisKey);
    const resetTime = now + (ttl > 0 ? ttl * 1000 : window * 1000);

    if (count > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.ceil(resetTime / 1000),
        retryAfter: ttl > 0 ? ttl : window,
      };
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - count),
      reset: Math.ceil(resetTime / 1000),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  }
}

/**
 * Pre-defined rate limit configurations
 */
export const RATE_LIMITS = {
  // AI Chat limits
  CHAT_FREE: { limit: 10, window: 3600 }, // 10 messages per hour
  CHAT_PRO: { limit: 100, window: 3600 }, // 100 messages per hour
  CHAT_ENTERPRISE: { limit: 1000, window: 3600 }, // 1000 messages per hour

  // API limits
  API_FREE: { limit: 100, window: 86400 }, // 100 calls per day
  API_PRO: { limit: 10000, window: 86400 }, // 10k calls per day
  API_ENTERPRISE: { limit: 100000, window: 86400 }, // 100k calls per day

  // Auth limits
  AUTH_LOGIN: { limit: 5, window: 900 }, // 5 attempts per 15 min
  AUTH_SIGNUP: { limit: 3, window: 3600 }, // 3 signups per hour per IP

  // General limits
  GENERAL: { limit: 60, window: 60 }, // 60 requests per minute
} as const;

/**
 * Get rate limit for user based on their plan
 */
export function getRateLimitForPlan(
  plan: string | undefined,
  type: "chat" | "api"
): { limit: number; window: number } {
  if (type === "chat") {
    switch (plan) {
      case "pro":
        return RATE_LIMITS.CHAT_PRO;
      case "enterprise":
        return RATE_LIMITS.CHAT_ENTERPRISE;
      default:
        return RATE_LIMITS.CHAT_FREE;
    }
  } else {
    switch (plan) {
      case "pro":
        return RATE_LIMITS.API_PRO;
      case "enterprise":
        return RATE_LIMITS.API_ENTERPRISE;
      default:
        return RATE_LIMITS.API_FREE;
    }
  }
}

/**
 * Reset rate limit for a specific key (admin use)
 */
export async function resetRateLimit(
  key: string,
  prefix: string = "rl"
): Promise<void> {
  const redisKey = `${prefix}:${key}`;
  await redis.del(redisKey);
}

/**
 * Get current usage without incrementing
 */
export async function getRateLimitStatus(
  key: string,
  prefix: string = "rl"
): Promise<{ count: number; ttl: number }> {
  const redisKey = `${prefix}:${key}`;
  try {
    const count = (await redis.get(redisKey)) || 0;
    const ttl = await redis.ttl(redisKey);
    return { count: Number(count), ttl: ttl > 0 ? ttl : 0 };
  } catch {
    return { count: 0, ttl: 0 };
  }
}
