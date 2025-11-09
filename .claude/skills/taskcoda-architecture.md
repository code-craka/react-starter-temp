# Taskcoda Architecture

> **Skill**: Complete architecture overview for Taskcoda SaaS platform
> **Last Updated**: 2025-11-09
> **Company**: TechSci, Inc.

---

## Table of Contents
- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Multi-Tenancy](#multi-tenancy)
- [Billing & Subscriptions](#billing--subscriptions)
- [Usage Tracking & Quotas](#usage-tracking--quotas)
- [Rate Limiting](#rate-limiting)
- [Audit Logging](#audit-logging)
- [Code Patterns](#code-patterns)

---

## System Overview

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React Router v7 + TailwindCSS v4 + shadcn/ui              │
│  (SSR, Real-time Updates, Responsive Design)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication                            │
│          Clerk (JWT, Sessions, User Management)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Convex)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Queries (Read)  │ Mutations (Write) │ Actions (API)  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Real-time Subscriptions │ Scheduled Functions       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┬──────────────────┐
      ▼              ▼              ▼                  ▼
┌──────────┐  ┌───────────┐  ┌──────────┐     ┌────────────┐
│  Convex  │  │  Upstash  │  │ Polar.sh │     │   OpenAI   │
│   DB     │  │   Redis   │  │ Payments │     │  AI Chat   │
│(11 Tables)│ │Rate Limit │  │ Webhooks │     │   API      │
└──────────┘  └───────────┘  └──────────┘     └────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │  Resend  │
                              │  Emails  │
                              └──────────┘
```

### Tech Stack

**Frontend**:
- React Router v7 (SSR, Routing, Data Loading)
- TypeScript (Type Safety)
- TailwindCSS v4 (Styling)
- shadcn/ui (UI Components)
- Framer Motion (Animations)
- Recharts (Analytics)

**Backend**:
- Convex (Serverless Database + Backend)
- Clerk (Authentication)
- Polar.sh (Billing)
- Upstash Redis (Rate Limiting)
- OpenAI (AI Chat via Vercel AI SDK)
- Resend (Transactional Emails)

**Monitoring**:
- Sentry (Error Tracking, Performance)
- Pino (Structured Logging)
- Convex Dashboard (Database Monitoring)

---

## Frontend Architecture

### React Router v7 Structure

```typescript
// Routes are file-based in app/routes/
app/routes/
├── home.tsx                    # Landing page (/)
├── pricing.tsx                 # Pricing page (/pricing)
├── contact.tsx                 # Contact form (/contact)
├── sign-in.tsx                 # Sign in (/sign-in)
├── sign-up.tsx                 # Sign up (/sign-up)
├── success.tsx                 # Payment success (/success)
├── subscription-required.tsx   # Paywall (/subscription-required)
├── dashboard/                  # Protected routes (/dashboard/*)
│   ├── layout.tsx             # Shared layout with sidebar
│   ├── index.tsx              # Dashboard home
│   ├── chat.tsx               # AI chat
│   ├── team.tsx               # Team management
│   ├── usage.tsx              # Usage analytics
│   ├── billing.tsx            # Billing management
│   └── settings.tsx           # User settings
├── admin/                      # Super admin routes (/admin/*)
│   ├── layout.tsx             # Admin layout
│   ├── index.tsx              # Admin dashboard
│   ├── users.tsx              # User management
│   ├── organizations.tsx      # Org management
│   ├── health.tsx             # System health
│   ├── features.tsx           # Feature flags
│   ├── analytics.tsx          # Analytics
│   └── monitoring.tsx         # Monitoring
└── [legal routes]              # Privacy, Terms, AUP, Cookies
```

### Component Structure

```typescript
app/components/
├── ui/                         # shadcn/ui components (25+)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── card.tsx
│   ├── sidebar.tsx
│   ├── tabs.tsx
│   └── [20+ more]
├── dashboard/                  # Dashboard components
│   ├── organization-switcher.tsx
│   ├── create-organization-dialog.tsx
│   ├── team-management.tsx
│   └── onboarding-flow.tsx
├── legal/                      # Legal page components
│   ├── privacy-policy.tsx
│   ├── terms-of-service.tsx
│   └── cookie-policy.tsx
└── admin/                      # Admin panel components
```

### State Management

Taskcoda uses **Convex real-time queries** for state management:

```typescript
// Automatic real-time updates
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

function MyComponent() {
  // Real-time query - updates automatically when data changes
  const organizations = useQuery(api.organizations.getUserOrganizations);

  // Mutation for write operations
  const createOrg = useMutation(api.organizations.createOrganization);

  return (
    <div>
      {organizations?.map(org => (
        <div key={org._id}>{org.name}</div>
      ))}
    </div>
  );
}
```

**No Redux, Zustand, or Context API needed** - Convex handles real-time state synchronization.

### Styling Approach

```typescript
// TailwindCSS v4 + shadcn/ui + Custom Components
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils"; // tailwind-merge utility

function MyFeature() {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
      <h2 className="text-2xl font-bold text-white mb-4">
        Modern Design
      </h2>
      <Button
        variant="secondary"
        size="lg"
        className={cn("hover:scale-105 transition-transform")}
      >
        Click Me
      </Button>
    </Card>
  );
}
```

---

## Backend Architecture

### Convex Serverless Functions

Convex provides three function types:

**Queries** (Read Operations):
```typescript
// convex/organizations.ts
export const getOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  }
});
```

**Mutations** (Write Operations):
```typescript
// convex/organizations.ts
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: identity.tokenIdentifier,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return orgId;
  }
});
```

**Actions** (External API Calls):
```typescript
// convex/billing.ts
export const createOrganizationCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    // Can call external APIs
    const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN });
    const checkout = await polar.checkouts.create({...});
    return { checkoutUrl: checkout.url };
  }
});
```

### Real-time Subscriptions

```typescript
// Automatic real-time updates when data changes
const messages = useQuery(api.chatMessages.list, { conversationId });
// UI updates automatically when new messages arrive!
```

### Scheduled Functions (Crons)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Run daily at midnight
crons.daily(
  "Reset monthly quotas",
  { hourUTC: 0, minuteUTC: 0 },
  internal.usageMetrics.resetMonthlyQuotas
);

export default crons;
```

---

## Database Schema

### Schema Definition

All tables defined in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    tokenIdentifier: v.string(),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("user")
    )),
    organizationId: v.optional(v.id("organizations")),
    isSuspended: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()), // Soft delete
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
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
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("suspended")
    ),
    invitedBy: v.optional(v.string()),
    invitedAt: v.optional(v.number()),
    joinedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_user", ["organizationId", "userId"]),

  // ... 8 more tables
});
```

### Table Relationships

```
users
  ├── organizationId → organizations
  └── tokenIdentifier → Clerk User

organizations
  ├── ownerId → users.tokenIdentifier
  └── subscriptionId → subscriptions

teamMembers
  ├── organizationId → organizations
  ├── userId → users.tokenIdentifier
  └── invitedBy → users.tokenIdentifier

subscriptions
  ├── userId → users.tokenIdentifier
  ├── organizationId → organizations
  └── polarId → Polar.sh Subscription

usageMetrics
  ├── organizationId → organizations
  └── userId → users.tokenIdentifier

auditLogs
  ├── userId → users.tokenIdentifier
  └── organizationId → organizations

chatMessages
  ├── organizationId → organizations
  └── userId → users.tokenIdentifier

featureFlags
  └── organizationId → organizations (optional - null = global)
```

### Indexes for Performance

```typescript
// Indexes optimize queries
.index("by_organization", ["organizationId"])
.index("by_organization_and_user", ["organizationId", "userId"])
.index("by_timestamp", ["timestamp"])

// Query using index
const members = await ctx.db
  .query("teamMembers")
  .withIndex("by_organization", q => q.eq("organizationId", orgId))
  .collect();
```

---

## Authentication & Authorization

### Clerk Integration

```typescript
// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [/* Clerk configuration */],
});
```

### Authentication Check Pattern

```typescript
// Standard auth check in mutations/queries
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthorized");
}

const userId = identity.tokenIdentifier;
const userEmail = identity.email;
```

### RBAC Implementation

```typescript
// convex/organizations.ts:615
export const checkPermission = query({
  args: {
    organizationId: v.id("organizations"),
    requiredRole: v.optional(
      v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasPermission: false, role: null };
    }

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("userId", identity.tokenIdentifier)
      )
      .first();

    if (!membership || membership.status !== "active") {
      return { hasPermission: false, role: null };
    }

    // Role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const hasPermission =
      roleHierarchy[membership.role] >= roleHierarchy[args.requiredRole];

    return { hasPermission, role: membership.role };
  },
});
```

Usage:
```typescript
// In frontend
const permission = useQuery(api.organizations.checkPermission, {
  organizationId,
  requiredRole: "admin"
});

if (!permission?.hasPermission) {
  return <AccessDenied />;
}
```

### Super Admin Checks

```typescript
// convex/admin.ts:9
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
```

---

## Multi-Tenancy

### Organization-Based Isolation

Every resource belongs to an organization:

```typescript
// All data scoped to organization
usageMetrics: {
  organizationId: v.id("organizations"), // Required
  userId: v.string(),
  metricType: v.string(),
  quantity: v.number(),
  // ...
}

// Query data for specific organization
const usage = await ctx.db
  .query("usageMetrics")
  .withIndex("by_organization", q => q.eq("organizationId", orgId))
  .collect();
```

### Team Member Management

```typescript
// convex/organizations.ts:321
export const inviteTeamMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userEmail: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    // 1. Check inviter is owner/admin
    const inviterMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("userId", identity.tokenIdentifier)
      )
      .first();

    if (!inviterMembership ||
        (inviterMembership.role !== "owner" &&
         inviterMembership.role !== "admin")) {
      throw new Error("Forbidden: Must be owner or admin");
    }

    // 2. Find user by email
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    // 3. Create pending membership
    const membershipId = await ctx.db.insert("teamMembers", {
      organizationId: args.organizationId,
      userId: invitedUser.tokenIdentifier,
      role: args.role,
      invitedBy: identity.tokenIdentifier,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. Send invitation email
    await ctx.scheduler.runAfter(0, internal.emails.sendTeamInvitationEmail, {
      to: args.userEmail,
      organizationName: org.name,
      role: args.role,
    });

    return membershipId;
  }
});
```

### Organization Switching

```typescript
// Users can be members of multiple organizations
const organizations = await ctx.db
  .query("teamMembers")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .filter((q) => q.eq(q.field("status"), "active"))
  .collect();

// Switch active organization
const activeOrg = organizations[0].organizationId;
```

---

## Billing & Subscriptions

### Polar.sh Integration

```typescript
// convex/billing.ts:60
export const createOrganizationCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    priceId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    // Initialize Polar client
    const polar = new Polar({
      server: process.env.POLAR_SERVER as "sandbox" | "production",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    // Create checkout session
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
      customerEmail: identity.email!,
      metadata: {
        organizationId: args.organizationId,
        userId: identity.subject,
        priceId: args.priceId,
        plan: args.plan,
      },
    });

    return { checkoutUrl: checkout.url };
  },
});
```

### Webhook Handling

```typescript
// convex/http.ts - Polar webhook handler
import { httpRouter } from "convex/server";

const http = httpRouter();

http.route({
  path: "/webhook/polar",
  method: "POST",
  handler: async (ctx, request) => {
    const signature = request.headers.get("webhook-signature");
    const payload = await request.json();

    // Verify webhook signature
    // Process subscription events
    // Update database

    return new Response("OK", { status: 200 });
  },
});

export default http;
```

### Subscription Plans

```typescript
// convex/usageMetrics.ts:390
export function getQuotaForPlan(plan: string): Record<string, number> {
  const quotas = {
    free: {
      ai_messages: 100,
      api_calls: 1000,
      storage_mb: 100,
      team_members: 3,
    },
    pro: {
      ai_messages: 10000,
      api_calls: 100000,
      storage_mb: 10000,
      team_members: 25,
    },
    enterprise: {
      ai_messages: Infinity,
      api_calls: Infinity,
      storage_mb: Infinity,
      team_members: Infinity,
    },
  };

  return quotas[plan as keyof typeof quotas] || quotas.free;
}
```

---

## Usage Tracking & Quotas

### Recording Usage

```typescript
// convex/usageMetrics.ts:15
export const recordUsage = mutation({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
    quantity: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    const periodStart = getMonthStart(now);
    const periodEnd = getMonthEnd(now);

    await ctx.db.insert("usageMetrics", {
      organizationId: args.organizationId,
      userId: identity.tokenIdentifier,
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
```

### Checking Quotas

```typescript
// convex/usageMetrics.ts:141
export const checkQuota = query({
  args: {
    organizationId: v.id("organizations"),
    metricType: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    const quotas = getQuotaForPlan(org.plan || "free");
    const limit = quotas[args.metricType];

    // Get current usage
    const now = Date.now();
    const periodStart = getMonthStart(now);
    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_organization_and_period", (q) =>
        q.eq("organizationId", args.organizationId)
         .eq("periodStart", periodStart)
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
```

### Metric Types

```typescript
export const METRIC_TYPES = {
  AI_MESSAGES: "ai_messages",
  API_CALLS: "api_calls",
  STORAGE_MB: "storage_mb",
  TEAM_MEMBERS: "team_members",
  WEBHOOK_CALLS: "webhook_calls",
  EXPORTS: "exports",
} as const;
```

---

## Rate Limiting

### Upstash Redis Implementation

```typescript
// convex/rateLimit.ts
import { Redis } from "@upstash/redis";
import { action } from "./_generated/server";

export const checkRateLimit = action({
  args: {
    identifier: v.string(), // user ID or organization ID
    endpoint: v.string(),
    limit: v.number(),
    window: v.number(), // in seconds
  },
  handler: async (ctx, args) => {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const key = `ratelimit:${args.identifier}:${args.endpoint}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, args.window);
    }

    const allowed = current <= args.limit;

    return {
      allowed,
      current,
      limit: args.limit,
      remaining: Math.max(0, args.limit - current),
    };
  },
});
```

### Plan-Based Rate Limits

```typescript
const rateLimits = {
  free: {
    api: { limit: 100, window: 3600 }, // 100/hour
    ai_chat: { limit: 10, window: 3600 }, // 10/hour
  },
  pro: {
    api: { limit: 10000, window: 3600 }, // 10k/hour
    ai_chat: { limit: 1000, window: 3600 }, // 1k/hour
  },
  enterprise: {
    api: { limit: Infinity, window: 3600 },
    ai_chat: { limit: Infinity, window: 3600 },
  },
};
```

---

## Audit Logging

### Creating Audit Logs

```typescript
// Every critical action creates an audit log
await ctx.db.insert("auditLogs", {
  userId: identity.tokenIdentifier,
  organizationId: args.organizationId,
  action: "ORG_CREATED",
  resource: `organization/${orgId}`,
  resourceId: orgId,
  status: "success",
  metadata: { name: args.name, slug: args.slug },
  timestamp: Date.now(),
});
```

### Audit Actions

```typescript
// convex/auditLogs.ts
export const AUDIT_ACTIONS = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_ACTIVATED: "USER_ACTIVATED",

  // Organization actions
  ORG_CREATED: "ORG_CREATED",
  ORG_UPDATED: "ORG_UPDATED",
  ORG_DELETED: "ORG_DELETED",

  // Team actions
  TEAM_MEMBER_INVITED: "TEAM_MEMBER_INVITED",
  TEAM_MEMBER_JOINED: "TEAM_MEMBER_JOINED",
  TEAM_MEMBER_REMOVED: "TEAM_MEMBER_REMOVED",
  TEAM_MEMBER_ROLE_CHANGED: "TEAM_MEMBER_ROLE_CHANGED",

  // Subscription actions
  SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_UPDATED: "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_CANCELED: "SUBSCRIPTION_CANCELED",

  // Admin actions
  SUBSCRIPTION_OVERRIDE: "SUBSCRIPTION_OVERRIDE",
  QUOTA_ADJUSTED: "QUOTA_ADJUSTED",
  FEATURE_FLAG_CREATED: "FEATURE_FLAG_CREATED",
  FEATURE_FLAG_UPDATED: "FEATURE_FLAG_UPDATED",
} as const;
```

### Querying Audit Logs

```typescript
// Get audit logs for organization
const auditLogs = await ctx.db
  .query("auditLogs")
  .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
  .order("desc")
  .take(100);

// Get failed actions
const failedActions = await ctx.db
  .query("auditLogs")
  .filter((q) => q.eq(q.field("status"), "failure"))
  .order("desc")
  .take(50);
```

---

## Code Patterns

### Standard Mutation Pattern

```typescript
export const myMutation = mutation({
  args: {
    // Define args with Zod-like validators
    name: v.string(),
    count: v.number(),
    optional: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 2. Check permissions (if needed)
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.orgId)
         .eq("userId", identity.tokenIdentifier)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Forbidden");
    }

    // 3. Perform operation
    const id = await ctx.db.insert("table", {
      ...args,
      userId: identity.tokenIdentifier,
      createdAt: Date.now(),
    });

    // 4. Create audit log
    await ctx.db.insert("auditLogs", {
      userId: identity.tokenIdentifier,
      action: "ITEM_CREATED",
      resource: `item/${id}`,
      status: "success",
      timestamp: Date.now(),
    });

    // 5. Record usage (if applicable)
    await ctx.db.insert("usageMetrics", {
      organizationId: args.orgId,
      userId: identity.tokenIdentifier,
      metricType: "api_calls",
      quantity: 1,
      periodStart: getMonthStart(Date.now()),
      periodEnd: getMonthEnd(Date.now()),
      timestamp: Date.now(),
    });

    // 6. Send notifications (if needed)
    await ctx.scheduler.runAfter(0, internal.emails.sendNotification, {
      to: identity.email,
      subject: "Item created",
    });

    return id;
  },
});
```

### Error Handling

```typescript
try {
  const result = await someOperation();

  // Success audit log
  await ctx.db.insert("auditLogs", {
    userId: identity.tokenIdentifier,
    action: "OPERATION_COMPLETED",
    resource: `resource/${id}`,
    status: "success",
    timestamp: Date.now(),
  });

  return result;
} catch (error) {
  // Failure audit log
  await ctx.db.insert("auditLogs", {
    userId: identity.tokenIdentifier,
    action: "OPERATION_FAILED",
    resource: `resource/${id}`,
    status: "failure",
    metadata: {
      error: error.message,
      stack: error.stack,
    },
    timestamp: Date.now(),
  });

  throw error;
}
```

### Soft Delete Pattern

```typescript
// Don't actually delete - set deletedAt timestamp
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const org = await ctx.db.get(args.organizationId);
    if (!org || org.ownerId !== identity.tokenIdentifier) {
      throw new Error("Forbidden: Must be owner");
    }

    // Soft delete
    await ctx.db.patch(args.organizationId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: identity.tokenIdentifier,
      organizationId: args.organizationId,
      action: "ORG_DELETED",
      resource: `organization/${args.organizationId}`,
      status: "success",
      timestamp: Date.now(),
    });

    return true;
  },
});

// Filter out deleted items in queries
const activeOrgs = await ctx.db
  .query("organizations")
  .filter((q) => q.eq(q.field("deletedAt"), undefined))
  .collect();
```

---

## Performance Considerations

### Index Usage
Always use indexes for queries:
```typescript
// ✅ Good - uses index
const members = await ctx.db
  .query("teamMembers")
  .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
  .collect();

// ❌ Bad - full table scan
const members = await ctx.db
  .query("teamMembers")
  .filter((q) => q.eq(q.field("organizationId"), orgId))
  .collect();
```

### Pagination
```typescript
// Limit results for large datasets
const logs = await ctx.db
  .query("auditLogs")
  .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
  .order("desc")
  .take(100); // Only get first 100
```

### Batch Operations
```typescript
// Use Promise.all for parallel operations
const membersWithDetails = await Promise.all(
  members.map(async (member) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", member.userId))
      .first();
    return { ...member, user };
  })
);
```

---

## Next Steps

- **[Convex Development](./convex-development.md)**: Detailed Convex patterns and best practices
- **[Admin Panel](./admin-panel-development.md)**: Super admin features
- **[Billing Integration](./billing-integration.md)**: Polar.sh payment flows
- **[Frontend Development](./frontend-development.md)**: React Router v7 and UI patterns
- **[Security & Compliance](./security-compliance.md)**: Security best practices

---

**This architecture is production-tested and powers Taskcoda's enterprise SaaS platform.**

---

## TypeScript Strict Typing Guidelines

### Core Rules for Taskcoda Development

**PROHIBITED TYPES** - Never use:
- ❌ `any` - Defeats type safety
- ❌ `null` - Use `undefined` instead  
- ❌ `unknown` - Use specific types

**REQUIRED PRACTICES**:
1. ✅ Always define explicit interfaces for props, API responses, and data structures
2. ✅ Use Convex validators (`v.string()`, `v.number()`, etc.) for all mutations/queries
3. ✅ Import proper context types: `QueryCtx`, `MutationCtx`, `ActionCtx` from Convex
4. ✅ Use `import.meta.env.VITE_*` for client-side environment variables (not `process.env`)
5. ✅ Define return types explicitly for all functions
6. ✅ Use union types for variants: `type Status = 'active' | 'inactive' | 'suspended'`
7. ✅ Prefer `undefined` over `null` for optional values
8. ✅ Type error handling properly with `instanceof Error` checks

**Quick Examples**:

```typescript
// ❌ BAD
function handleData(data: any) { }
const config: Record<string, any> = {};
catch (error: any) { }

// ✅ GOOD
interface UserData { id: string; name: string; }
function handleData(data: UserData) { }

interface Config { [key: string]: string | number | boolean; }
const config: Config = {};

catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

**See `frontend-development.md` and `convex-development.md` for comprehensive TypeScript guidelines.**

