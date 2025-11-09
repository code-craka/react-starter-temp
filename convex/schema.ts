import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.optional(v.union(v.literal("super_admin"), v.literal("admin"), v.literal("user"))),
    organizationId: v.optional(v.id("organizations")),
    isSuspended: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()), // Soft delete for compliance
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(), // User tokenIdentifier
    plan: v.optional(v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise")
    )),
    subscriptionId: v.optional(v.id("subscriptions")),
    // Settings with known structure for type safety
    settings: v.optional(v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))),
      emailNotifications: v.optional(v.boolean()),
      weeklyReports: v.optional(v.boolean()),
    })),
    // Flexible metadata for additional custom data
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_plan", ["plan"]),

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
    // User/Organization links
    userId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),

    // Polar IDs (required for syncing with Polar.sh)
    polarId: v.string(),
    customerId: v.string(),
    productId: v.string(),

    // Pricing details
    polarPriceId: v.optional(v.string()),
    currency: v.string(),
    interval: v.optional(v.union(
      v.literal("month"),
      v.literal("year")
    )),
    amount: v.number(),

    // Subscription status (Polar.sh enum values)
    status: v.union(
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("trialing"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("unpaid"),
      v.literal("revoked")
    ),

    // Timestamps (stored as Unix ms)
    createdAt: v.number(),
    modifiedAt: v.optional(v.number()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),

    // Cancellation details
    cancelAtPeriodEnd: v.boolean(),
    customerCancellationReason: v.optional(v.union(
      v.literal("customer_service"),
      v.literal("too_expensive"),
      v.literal("missing_features"),
      v.literal("switched_service"),
      v.literal("unused"),
      v.literal("other")
    )),
    customerCancellationComment: v.optional(v.string()),

    // Additional Polar.sh fields
    discountId: v.optional(v.string()),
    checkoutId: v.optional(v.string()),

    // Metadata - structured for known fields
    metadata: v.optional(v.object({
      userId: v.optional(v.string()),
      organizationId: v.optional(v.string()),
      plan: v.optional(v.string()),
    })),
    // Custom fields - keep flexible as Polar allows arbitrary custom fields
    customFieldData: v.optional(v.any()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"])
    .index("organizationId", ["organizationId"])
    .index("customerId", ["customerId"])
    .index("productId", ["productId"])
    .index("status", ["status"]),

  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    // Flexible data storage for different webhook event types
    // Each event type has a different payload structure
    // Type-safe access should be done in query/mutation handlers
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

  // Feature Flags - Enable/disable features per organization
  featureFlags: defineTable({
    name: v.string(), // e.g., "advanced_analytics", "api_access"
    description: v.string(),
    enabled: v.boolean(), // Global toggle
    organizationId: v.optional(v.id("organizations")), // Null = global, otherwise org-specific
    rolloutPercentage: v.optional(v.number()), // For gradual rollout 0-100
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_organization", ["organizationId"])
    .index("by_enabled", ["enabled"]),

  // System Metrics - Aggregated analytics data
  systemMetrics: defineTable({
    metricType: v.string(), // "dau", "mau", "revenue", "api_calls"
    value: v.number(),
    date: v.string(), // YYYY-MM-DD
    metadata: v.optional(v.any()), // Additional breakdown data
    timestamp: v.number(),
  })
    .index("by_type", ["metricType"])
    .index("by_date", ["date"])
    .index("by_type_and_date", ["metricType", "date"]),
});
