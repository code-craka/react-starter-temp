/**
 * Usage Metering System
 *
 * Track consumption for billing and quota enforcement.
 * Supports AI messages, API calls, storage, and custom metrics.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Record usage metric
 */
export const recordUsage = mutation({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
    quantity: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;
    const now = Date.now();

    // Calculate billing period (monthly)
    const periodStart = getMonthStart(now);
    const periodEnd = getMonthEnd(now);

    // Record usage
    await ctx.db.insert("usageMetrics", {
      organizationId: args.organizationId,
      userId,
      metricType: args.metricType,
      quantity: args.quantity,
      metadata: args.metadata,
      periodStart,
      periodEnd,
      timestamp: now,
    });

    return true;
  },
});

/**
 * Get current usage for organization
 */
export const getCurrentUsage = query({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const periodStart = getMonthStart(now);

    // Get all usage for current period
    let usageQuery = ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", periodStart)
      );

    const allUsage = await usageQuery.collect();

    // Filter by metric type if specified
    const filteredUsage = args.metricType
      ? allUsage.filter((u) => u.metricType === args.metricType)
      : allUsage;

    // Aggregate by metric type
    const aggregated: Record<string, number> = {};
    filteredUsage.forEach((usage) => {
      aggregated[usage.metricType] =
        (aggregated[usage.metricType] || 0) + usage.quantity;
    });

    return {
      period: { start: periodStart, end: getMonthEnd(now) },
      usage: aggregated,
      total: filteredUsage.reduce((sum, u) => sum + u.quantity, 0),
    };
  },
});

/**
 * Get usage history
 */
export const getUsageHistory = query({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const months = args.months || 6;
    const now = Date.now();
    const history: Array<{
      period: { start: number; end: number };
      usage: number;
    }> = [];

    // Get usage for each month
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - i);
      const periodStart = getMonthStart(monthDate.getTime());
      const periodEnd = getMonthEnd(monthDate.getTime());

      const usage = await ctx.db
        .query("usageMetrics")
        .withIndex("by_organization_and_period", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("periodStart", periodStart)
        )
        .filter((q) => q.eq(q.field("metricType"), args.metricType))
        .collect();

      const total = usage.reduce((sum, u) => sum + u.quantity, 0);

      history.push({
        period: { start: periodStart, end: periodEnd },
        usage: total,
      });
    }

    return history.reverse();
  },
});

/**
 * Check if organization has quota available
 */
export const checkQuota = query({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    // Get organization plan
    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new Error("Organization not found");
    }

    // Get quota limits based on plan
    const quotas = getQuotaForPlan(org.plan || "free");
    const limit = quotas[args.metricType];

    if (!limit) {
      // No limit for this metric
      return {
        hasQuota: true,
        used: 0,
        limit: Infinity,
        remaining: Infinity,
        percentage: 0,
      };
    }

    // Get current usage
    const now = Date.now();
    const periodStart = getMonthStart(now);

    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", periodStart)
      )
      .filter((q) => q.eq(q.field("metricType"), args.metricType))
      .collect();

    const used = usage.reduce((sum, u) => sum + u.quantity, 0);
    const remaining = Math.max(0, limit - used);
    const percentage = Math.min(100, (used / limit) * 100);

    return {
      hasQuota: used < limit,
      used,
      limit,
      remaining,
      percentage,
    };
  },
});

/**
 * Internal query to check quota (used by HTTP endpoints)
 */
export const checkQuotaInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    // Get organization plan
    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new Error("Organization not found");
    }

    // Get quota limits based on plan
    const quotas = getQuotaForPlan(org.plan || "free");
    const limit = quotas[args.metricType];

    if (!limit) {
      // No limit for this metric
      return {
        hasQuota: true,
        used: 0,
        limit: Infinity,
        remaining: Infinity,
        percentage: 0,
      };
    }

    // Get current usage
    const now = Date.now();
    const periodStart = getMonthStart(now);

    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", periodStart)
      )
      .filter((q) => q.eq(q.field("metricType"), args.metricType))
      .collect();

    const used = usage.reduce((sum, u) => sum + u.quantity, 0);
    const remaining = Math.max(0, limit - used);
    const percentage = Math.min(100, (used / limit) * 100);

    return {
      hasQuota: used < limit,
      used,
      limit,
      remaining,
      percentage,
    };
  },
});

/**
 * Internal mutation to record usage (used by HTTP endpoints)
 */
export const recordUsageInternal = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
    metricType: v.string(),
    quantity: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Calculate billing period (monthly)
    const periodStart = getMonthStart(now);
    const periodEnd = getMonthEnd(now);

    // Record usage
    await ctx.db.insert("usageMetrics", {
      organizationId: args.organizationId,
      userId: args.userId,
      metricType: args.metricType,
      quantity: args.quantity,
      metadata: args.metadata,
      periodStart,
      periodEnd,
      timestamp: now,
    });

    return true;
  },
});

/**
 * Get detailed usage breakdown by user
 */
export const getUsageByUser = query({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const periodStart = getMonthStart(now);

    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", periodStart)
      )
      .filter((q) => q.eq(q.field("metricType"), args.metricType))
      .collect();

    // Aggregate by user
    const byUser: Record<string, number> = {};
    usage.forEach((u) => {
      byUser[u.userId] = (byUser[u.userId] || 0) + u.quantity;
    });

    // Enrich with user details
    const enriched = await Promise.all(
      Object.entries(byUser).map(async ([userId, quantity]) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
          .first();

        return {
          userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          quantity,
        };
      })
    );

    return enriched.sort((a, b) => b.quantity - a.quantity);
  },
});

/**
 * Export usage data for billing
 */
export const exportUsageForBilling = query({
  args: {
    organizationId: v.id("organizations"),
    periodStart: v.number(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("periodStart", args.periodStart)
      )
      .collect();

    // Aggregate by metric type
    const aggregated: Record<string, { quantity: number; details: any[] }> = {};

    usage.forEach((u) => {
      if (!aggregated[u.metricType]) {
        aggregated[u.metricType] = { quantity: 0, details: [] };
      }
      aggregated[u.metricType].quantity += u.quantity;
      aggregated[u.metricType].details.push({
        timestamp: u.timestamp,
        userId: u.userId,
        quantity: u.quantity,
        metadata: u.metadata,
      });
    });

    return {
      organizationId: args.organizationId,
      period: { start: args.periodStart, end: args.periodEnd },
      metrics: aggregated,
      totalUsage: usage.reduce((sum, u) => sum + u.quantity, 0),
    };
  },
});

// Helper functions

function getMonthStart(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function getMonthEnd(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
}

/**
 * Quota limits by plan
 */
export function getQuotaForPlan(plan: string): Record<string, number> {
  const quotas = {
    free: {
      ai_messages: 100, // 100 AI messages per month
      api_calls: 1000, // 1k API calls per month
      storage_mb: 100, // 100 MB storage
      team_members: 3, // 3 team members max
    },
    pro: {
      ai_messages: 10000, // 10k AI messages per month
      api_calls: 100000, // 100k API calls per month
      storage_mb: 10000, // 10 GB storage
      team_members: 25, // 25 team members max
    },
    enterprise: {
      ai_messages: Infinity, // Unlimited
      api_calls: Infinity, // Unlimited
      storage_mb: Infinity, // Unlimited
      team_members: Infinity, // Unlimited
    },
  };

  return quotas[plan as keyof typeof quotas] || quotas.free;
}

/**
 * Metric types
 */
export const METRIC_TYPES = {
  AI_MESSAGES: "ai_messages",
  API_CALLS: "api_calls",
  STORAGE_MB: "storage_mb",
  TEAM_MEMBERS: "team_members",
  WEBHOOK_CALLS: "webhook_calls",
  EXPORTS: "exports",
} as const;

export type MetricType = (typeof METRIC_TYPES)[keyof typeof METRIC_TYPES];
