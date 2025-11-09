import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    organizationId: v.optional(v.id("organizations")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()), // Soft delete for compliance
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(), // User tokenIdentifier
    plan: v.optional(v.string()), // "free", "pro", "enterprise"
    subscriptionId: v.optional(v.id("subscriptions")),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  teamMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(), // User tokenIdentifier
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    invitedBy: v.optional(v.string()),
    invitedAt: v.optional(v.number()),
    joinedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("suspended")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_user", ["organizationId", "userId"]),

  subscriptions: defineTable({
    userId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"])
    .index("organizationId", ["organizationId"]),

  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),

  // Audit Logs - Immutable record of all critical actions
  auditLogs: defineTable({
    userId: v.string(), // Who performed the action
    organizationId: v.optional(v.id("organizations")),
    action: v.string(), // e.g., "USER_CREATED", "SUBSCRIPTION_UPDATED"
    resource: v.string(), // e.g., "user/123", "subscription/456"
    resourceId: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("failure")),
    metadata: v.optional(v.any()), // Additional context
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_resource", ["resource"]),

  // Usage Metrics - Track consumption per organization
  usageMetrics: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    metricType: v.string(), // "ai_messages", "api_calls", "storage"
    quantity: v.number(),
    metadata: v.optional(v.any()),
    periodStart: v.number(), // Unix timestamp for billing period
    periodEnd: v.number(),
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_metric_type", ["metricType"])
    .index("by_period", ["periodStart", "periodEnd"])
    .index("by_organization_and_period", ["organizationId", "periodStart"]),

  // Chat Messages - Persist chat history
  chatMessages: defineTable({
    organizationId: v.id("organizations"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    metadata: v.optional(v.any()),
    conversationId: v.optional(v.string()), // Group messages by conversation
    timestamp: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_conversation", ["conversationId"])
    .index("by_timestamp", ["timestamp"]),

  // Contact Form Submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    submittedAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("responded"), v.literal("spam")),
    ipAddress: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),
});
