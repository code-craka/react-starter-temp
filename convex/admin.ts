import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

async function requireSuperAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("tokenIdentifier"), userId))
    .first();

  if (!user || user.role !== "super_admin") {
    throw new Error("Super admin access required");
  }

  return { userId, user };
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const searchUsers = query({
  args: {
    searchQuery: v.optional(v.string()),
    role: v.optional(v.string()),
    suspended: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    let usersQuery = ctx.db.query("users");

    // Apply filters
    if (args.role) {
      usersQuery = usersQuery.filter((q) => q.eq(q.field("role"), args.role));
    }

    if (args.suspended !== undefined) {
      usersQuery = usersQuery.filter((q) =>
        q.eq(q.field("isSuspended"), args.suspended)
      );
    }

    const allUsers = await usersQuery.collect();

    // Client-side search filtering
    let filteredUsers = allUsers;
    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      filteredUsers = allUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.tokenIdentifier.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      hasMore: offset + limit < filteredUsers.length,
    };
  },
});

export const getUserDetails = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's organization
    let organization = null;
    if (user.organizationId) {
      organization = await ctx.db.get(user.organizationId);
    }

    // Get user's audit logs (last 50)
    const auditLogs = await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(50);

    // Get user's subscription
    let subscription = null;
    const userSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    if (userSubscription) {
      subscription = userSubscription;
    }

    // Get usage metrics (current month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const usageMetrics = await ctx.db
      .query("usageMetrics")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gte(q.field("periodStart"), periodStart)
        )
      )
      .collect();

    return {
      user,
      organization,
      auditLogs,
      subscription,
      usageMetrics,
    };
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "super_admin") {
      throw new Error("Cannot suspend super admin users");
    }

    // Update user
    await ctx.db.patch(user._id, {
      isSuspended: true,
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: user.organizationId,
      action: "USER_SUSPENDED",
      resource: `user/${args.userId}`,
      resourceId: args.userId,
      status: "success",
      metadata: { reason: args.reason },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const activateUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user
    await ctx.db.patch(user._id, {
      isSuspended: false,
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: user.organizationId,
      action: "USER_ACTIVATED",
      resource: `user/${args.userId}`,
      resourceId: args.userId,
      status: "success",
      metadata: {},
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getUserActivity = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const limit = args.limit || 100;

    const auditLogs = await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(limit);

    return auditLogs;
  },
});

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export const listOrganizations = query({
  args: {
    searchQuery: v.optional(v.string()),
    plan: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const allOrgs = await ctx.db.query("organizations").collect();

    // Client-side filtering
    let filteredOrgs = allOrgs;

    if (args.plan) {
      filteredOrgs = filteredOrgs.filter((org) => org.plan === args.plan);
    }

    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      filteredOrgs = filteredOrgs.filter(
        (org) =>
          org.name.toLowerCase().includes(searchLower) ||
          org.slug.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedOrgs = filteredOrgs.slice(offset, offset + limit);

    // Get member counts for each org
    const orgsWithCounts = await Promise.all(
      paginatedOrgs.map(async (org) => {
        const memberCount = await ctx.db
          .query("teamMembers")
          .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
          .collect()
          .then((members) => members.length);

        return {
          ...org,
          memberCount,
        };
      })
    );

    return {
      organizations: orgsWithCounts,
      total: filteredOrgs.length,
      hasMore: offset + limit < filteredOrgs.length,
    };
  },
});

export const getOrganizationDetails = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("tokenIdentifier"), member.userId))
          .first();
        return {
          ...member,
          user,
        };
      })
    );

    // Get subscription
    let subscription = null;
    if (organization.subscriptionId) {
      subscription = await ctx.db.get(organization.subscriptionId);
    }

    // Get usage metrics (current month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const usageMetrics = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId).eq("periodStart", periodStart)
      )
      .collect();

    // Get audit logs (last 100)
    const auditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(100);

    return {
      organization,
      members: membersWithDetails,
      subscription,
      usageMetrics,
      auditLogs,
    };
  },
});

export const overrideSubscription = mutation({
  args: {
    organizationId: v.id("organizations"),
    newPlan: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update organization plan
    await ctx.db.patch(args.organizationId, {
      plan: args.newPlan,
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: args.organizationId,
      action: "SUBSCRIPTION_OVERRIDE",
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      metadata: {
        oldPlan: organization.plan,
        newPlan: args.newPlan,
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const adjustQuota = mutation({
  args: {
    organizationId: v.id("organizations"),
    quotaType: v.string(),
    newLimit: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update organization settings with new quota
    const currentSettings = organization.settings || {};
    const updatedSettings = {
      ...currentSettings,
      quotas: {
        ...(currentSettings.quotas || {}),
        [args.quotaType]: args.newLimit,
      },
    };

    await ctx.db.patch(args.organizationId, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: args.organizationId,
      action: "QUOTA_ADJUSTED",
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      metadata: {
        quotaType: args.quotaType,
        newLimit: args.newLimit,
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Active users (logged in within last 24 hours)
    const allUsers = await ctx.db.query("users").collect();
    const activeUsers = allUsers.filter(
      (user) => user.lastLoginAt && user.lastLoginAt > oneDayAgo
    ).length;

    // Total users
    const totalUsers = allUsers.length;

    // Total organizations
    const totalOrgs = await ctx.db.query("organizations").collect();

    // Active subscriptions
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active"
    ).length;

    // Recent audit logs (for error rate)
    const recentAuditLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", oneDayAgo))
      .collect();

    const totalActions = recentAuditLogs.length;
    const failedActions = recentAuditLogs.filter(
      (log) => log.status === "failure"
    ).length;
    const errorRate =
      totalActions > 0 ? (failedActions / totalActions) * 100 : 0;

    // API calls today
    const today = new Date().toISOString().split("T")[0];
    const todayMetrics = await ctx.db
      .query("systemMetrics")
      .withIndex("by_type_and_date", (q) =>
        q.eq("metricType", "api_calls").eq("date", today)
      )
      .first();

    const apiCallsToday = todayMetrics?.value || 0;

    return {
      activeUsers,
      totalUsers,
      totalOrganizations: totalOrgs.length,
      activeSubscriptions,
      errorRate: parseFloat(errorRate.toFixed(2)),
      apiCallsToday,
      totalActionsLast24h: totalActions,
      failedActionsLast24h: failedActions,
    };
  },
});

export const getRecentErrors = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const limit = args.limit || 50;

    const failedAudits = await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("status"), "failure"))
      .order("desc")
      .take(limit);

    return failedAudits;
  },
});

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const listFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const flags = await ctx.db.query("featureFlags").collect();
    return flags;
  },
});

export const createFeatureFlag = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    enabled: v.boolean(),
    organizationId: v.optional(v.id("organizations")),
    rolloutPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    // Check if flag already exists
    const existingFlag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingFlag) {
      throw new Error("Feature flag with this name already exists");
    }

    const now = Date.now();

    const flagId = await ctx.db.insert("featureFlags", {
      name: args.name,
      description: args.description,
      enabled: args.enabled,
      organizationId: args.organizationId,
      rolloutPercentage: args.rolloutPercentage || 0,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: args.organizationId,
      action: "FEATURE_FLAG_CREATED",
      resource: `feature_flag/${args.name}`,
      resourceId: flagId,
      status: "success",
      metadata: { name: args.name },
      timestamp: now,
    });

    return { flagId };
  },
});

export const updateFeatureFlag = mutation({
  args: {
    flagId: v.id("featureFlags"),
    enabled: v.optional(v.boolean()),
    rolloutPercentage: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const flag = await ctx.db.get(args.flagId);
    if (!flag) {
      throw new Error("Feature flag not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.enabled !== undefined) updates.enabled = args.enabled;
    if (args.rolloutPercentage !== undefined)
      updates.rolloutPercentage = args.rolloutPercentage;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.flagId, updates);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: flag.organizationId,
      action: "FEATURE_FLAG_UPDATED",
      resource: `feature_flag/${flag.name}`,
      resourceId: args.flagId,
      status: "success",
      metadata: { updates },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const deleteFeatureFlag = mutation({
  args: {
    flagId: v.id("featureFlags"),
  },
  handler: async (ctx, args) => {
    const { userId: adminUserId } = await requireSuperAdmin(ctx);

    const flag = await ctx.db.get(args.flagId);
    if (!flag) {
      throw new Error("Feature flag not found");
    }

    await ctx.db.delete(args.flagId);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      organizationId: flag.organizationId,
      action: "FEATURE_FLAG_DELETED",
      resource: `feature_flag/${flag.name}`,
      resourceId: args.flagId,
      status: "success",
      metadata: { name: flag.name },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// ANALYTICS
// ============================================================================

export const getRevenueMetrics = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    // Get all active subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Calculate MRR
    const mrr = subscriptions.reduce((sum, sub) => {
      if (sub.interval === "month" && sub.amount) {
        return sum + sub.amount;
      } else if (sub.interval === "year" && sub.amount) {
        return sum + sub.amount / 12;
      }
      return sum;
    }, 0);

    // Calculate ARR
    const arr = mrr * 12;

    // Get historical revenue data
    const revenueMetrics = await ctx.db
      .query("systemMetrics")
      .withIndex("by_type", (q) => q.eq("metricType", "revenue"))
      .collect();

    // Filter by date range
    const filteredMetrics = revenueMetrics.filter((metric) => {
      return metric.date >= args.startDate && metric.date <= args.endDate;
    });

    // Calculate churn rate (simplified - based on canceled subscriptions)
    const canceledSubs = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "canceled"))
      .collect();

    const totalSubs = subscriptions.length + canceledSubs.length;
    const churnRate =
      totalSubs > 0 ? (canceledSubs.length / totalSubs) * 100 : 0;

    return {
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      churnRate: parseFloat(churnRate.toFixed(2)),
      activeSubscriptions: subscriptions.length,
      canceledSubscriptions: canceledSubs.length,
      historicalData: filteredMetrics,
    };
  },
});

export const getUserEngagementMetrics = query({
  args: {
    days: v.number(), // Number of days to look back
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const now = Date.now();
    const daysAgo = now - args.days * 24 * 60 * 60 * 1000;

    const allUsers = await ctx.db.query("users").collect();

    // DAU (Daily Active Users - last 24 hours)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const dau = allUsers.filter(
      (user) => user.lastLoginAt && user.lastLoginAt > oneDayAgo
    ).length;

    // MAU (Monthly Active Users - last 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const mau = allUsers.filter(
      (user) => user.lastLoginAt && user.lastLoginAt > thirtyDaysAgo
    ).length;

    // Active users in specified period
    const activeInPeriod = allUsers.filter(
      (user) => user.lastLoginAt && user.lastLoginAt > daysAgo
    ).length;

    // Get chat messages as engagement proxy
    const chatMessages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.gt(q.field("timestamp"), daysAgo))
      .collect();

    // Get usage metrics
    const usageMetrics = await ctx.db
      .query("usageMetrics")
      .filter((q) => q.gt(q.field("timestamp"), daysAgo))
      .collect();

    // Calculate retention (users who logged in both at start and end of period)
    const midPoint = daysAgo + (now - daysAgo) / 2;
    const activeInFirstHalf = new Set(
      allUsers
        .filter(
          (user) =>
            user.lastLoginAt &&
            user.lastLoginAt > daysAgo &&
            user.lastLoginAt < midPoint
        )
        .map((u) => u._id)
    );
    const activeInSecondHalf = new Set(
      allUsers
        .filter(
          (user) => user.lastLoginAt && user.lastLoginAt > midPoint
        )
        .map((u) => u._id)
    );

    const retainedUsers = [...activeInFirstHalf].filter((id) =>
      activeInSecondHalf.has(id)
    ).length;
    const retentionRate =
      activeInFirstHalf.size > 0
        ? (retainedUsers / activeInFirstHalf.size) * 100
        : 0;

    return {
      dau,
      mau,
      activeInPeriod,
      retentionRate: parseFloat(retentionRate.toFixed(2)),
      totalChatMessages: chatMessages.length,
      totalUsageEvents: usageMetrics.length,
      engagementRate:
        allUsers.length > 0
          ? parseFloat(((activeInPeriod / allUsers.length) * 100).toFixed(2))
          : 0,
    };
  },
});

export const getFeatureUsageMetrics = query({
  args: {
    days: v.number(),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const now = Date.now();
    const daysAgo = now - args.days * 24 * 60 * 60 * 1000;

    // Get usage metrics grouped by type
    const usageMetrics = await ctx.db
      .query("usageMetrics")
      .filter((q) => q.gt(q.field("timestamp"), daysAgo))
      .collect();

    // Group by metric type
    const featureUsage: Record<string, number> = {};
    usageMetrics.forEach((metric) => {
      if (!featureUsage[metric.metricType]) {
        featureUsage[metric.metricType] = 0;
      }
      featureUsage[metric.metricType] += metric.quantity;
    });

    // Get chat usage
    const chatMessages = await ctx.db
      .query("chatMessages")
      .filter((q) => q.gt(q.field("timestamp"), daysAgo))
      .collect();

    featureUsage["chat_messages"] = chatMessages.length;

    return featureUsage;
  },
});

// ============================================================================
// SYSTEM METRICS RECORDING (for analytics)
// ============================================================================

export const recordSystemMetric = mutation({
  args: {
    metricType: v.string(),
    value: v.number(),
    date: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // This can be called by scheduled functions to record daily metrics
    await ctx.db.insert("systemMetrics", {
      metricType: args.metricType,
      value: args.value,
      date: args.date,
      metadata: args.metadata || {},
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
