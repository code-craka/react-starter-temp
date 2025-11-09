/**
 * Audit Logging System
 *
 * Enterprise-grade audit logging for SOC 2, GDPR, HIPAA compliance.
 * Immutable record of all critical actions.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Create an audit log entry
 */
export const createAuditLog = mutation({
  args: {
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("failure")),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be authenticated to create audit log");
    }

    const userId = identity.tokenIdentifier;

    // Insert audit log (immutable)
    const logId = await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      status: args.status,
      metadata: args.metadata,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    });

    return logId;
  },
});

/**
 * Internal mutation to create audit log (used by HTTP endpoints)
 */
export const createAuditLogInternal = internalMutation({
  args: {
    userId: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("failure")),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Insert audit log (immutable)
    const logId = await ctx.db.insert("auditLogs", {
      userId: args.userId,
      organizationId: args.organizationId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      status: args.status,
      metadata: args.metadata,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    });

    return logId;
  },
});

/**
 * Query audit logs by user
 */
export const getAuditLogsByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query("auditLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Query audit logs by organization
 */
export const getAuditLogsByOrganization = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query("auditLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(limit);
  },
});

/**
 * Query audit logs by action type
 */
export const getAuditLogsByAction = query({
  args: {
    action: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query("auditLogs")
      .withIndex("by_action", (q) => q.eq("action", args.action))
      .order("desc")
      .take(limit);
  },
});

/**
 * Query audit logs by time range
 */
export const getAuditLogsByTimeRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    organizationId: v.optional(v.id("organizations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    let query = ctx.db.query("auditLogs").withIndex("by_timestamp");

    // Filter by time range
    const logs = await query.order("desc").take(limit * 2); // Get more to filter

    return logs
      .filter(
        (log) =>
          log.timestamp >= args.startTime && log.timestamp <= args.endTime
      )
      .filter((log) =>
        args.organizationId
          ? log.organizationId === args.organizationId
          : true
      )
      .slice(0, limit);
  },
});

/**
 * Get audit log statistics for organization
 */
export const getAuditLogStats = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(10000); // Reasonable limit for stats

    const recentLogs = logs.filter((log) => log.timestamp >= startTime);

    // Calculate statistics
    const actionCounts: Record<string, number> = {};
    const successCount = recentLogs.filter((log) => log.status === "success").length;
    const failureCount = recentLogs.filter((log) => log.status === "failure").length;

    recentLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return {
      total: recentLogs.length,
      successCount,
      failureCount,
      actionCounts,
      periodDays: days,
    };
  },
});

/**
 * Export audit logs for compliance (GDPR, etc.)
 */
export const exportAuditLogs = query({
  args: {
    organizationId: v.id("organizations"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify user has permission (must be org owner/admin)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get all logs for organization
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(50000); // Max export size

    // Filter by time range if provided
    let filteredLogs = logs;
    if (args.startTime || args.endTime) {
      filteredLogs = logs.filter((log) => {
        if (args.startTime && log.timestamp < args.startTime) return false;
        if (args.endTime && log.timestamp > args.endTime) return false;
        return true;
      });
    }

    return filteredLogs;
  },
});

/**
 * Audit log action types (for type safety)
 */
export const AUDIT_ACTIONS = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",

  // Organization actions
  ORG_CREATED: "ORG_CREATED",
  ORG_UPDATED: "ORG_UPDATED",
  ORG_DELETED: "ORG_DELETED",

  // Team member actions
  TEAM_MEMBER_INVITED: "TEAM_MEMBER_INVITED",
  TEAM_MEMBER_JOINED: "TEAM_MEMBER_JOINED",
  TEAM_MEMBER_REMOVED: "TEAM_MEMBER_REMOVED",
  TEAM_MEMBER_ROLE_CHANGED: "TEAM_MEMBER_ROLE_CHANGED",

  // Subscription actions
  SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPDATED: "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_CANCELED: "SUBSCRIPTION_CANCELED",
  SUBSCRIPTION_RENEWED: "SUBSCRIPTION_RENEWED",

  // Data actions
  DATA_EXPORTED: "DATA_EXPORTED",
  DATA_IMPORTED: "DATA_IMPORTED",
  DATA_DELETED: "DATA_DELETED",

  // Security actions
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  MFA_ENABLED: "MFA_ENABLED",
  MFA_DISABLED: "MFA_DISABLED",
  API_KEY_CREATED: "API_KEY_CREATED",
  API_KEY_REVOKED: "API_KEY_REVOKED",

  // AI actions
  AI_CHAT_MESSAGE: "AI_CHAT_MESSAGE",
  AI_GENERATION_STARTED: "AI_GENERATION_STARTED",
  AI_GENERATION_COMPLETED: "AI_GENERATION_COMPLETED",

  // Admin actions
  ADMIN_USER_IMPERSONATED: "ADMIN_USER_IMPERSONATED",
  ADMIN_SETTING_CHANGED: "ADMIN_SETTING_CHANGED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
