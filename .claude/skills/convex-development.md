# Convex Development Guide

> **Skill**: Convex backend development patterns for Taskcoda
> **Focus**: Queries, Mutations, Actions, Schema, Real-time, Scheduled Functions
> **Last Updated**: 2025-11-09

---

## Table of Contents
- [Convex Basics](#convex-basics)
- [Schema Design](#schema-design)
- [Queries (Read)](#queries-read)
- [Mutations (Write)](#mutations-write)
- [Actions (External APIs)](#actions-external-apis)
- [Internal Functions](#internal-functions)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Scheduled Functions](#scheduled-functions)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Convex Basics

### Function Types

| Type | Purpose | Can Call External APIs | Can Modify DB | Deterministic |
|------|---------|----------------------|---------------|---------------|
| Query | Read data | ❌ No | ❌ No | ✅ Yes |
| Mutation | Write data | ❌ No | ✅ Yes | ✅ Yes |
| Action | External API calls | ✅ Yes | ❌ No (can call mutations) | ❌ No |
| Internal Query | Server-side reads | ❌ No | ❌ No | ✅ Yes |
| Internal Mutation | Server-side writes | ❌ No | ✅ Yes | ✅ Yes |

### Import Patterns

```typescript
// Standard exports (client-accessible)
import { query, mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";

// Internal exports (server-only)
import { internalQuery, internalMutation, internalAction } from "./_generated/server";

// Validators
import { v } from "convex/values";

// Generated types
import { Id } from "./_generated/dataModel";
```

---

## Schema Design

### Defining Tables

From `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
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
    plan: v.optional(v.string()),
    subscriptionId: v.optional(v.id("subscriptions")),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),
});
```

### Field Types

```typescript
v.string()                    // String
v.number()                    // Number
v.boolean()                   // Boolean
v.null()                      // Null
v.id("tableName")             // Reference to another table
v.optional(v.string())        // Optional field
v.union(v.literal("a"), v.literal("b"))  // Enum-like
v.array(v.string())           // Array of strings
v.object({ key: v.string() }) // Nested object
v.any()                       // Flexible JSON data
```

### Indexes

```typescript
// Single field index
.index("by_email", ["email"])

// Composite index (order matters!)
.index("by_organization_and_user", ["organizationId", "userId"])

// Compound index for range queries
.index("by_organization_and_period", ["organizationId", "periodStart"])
```

**Index Best Practices**:
- Add indexes for all fields used in `withIndex()` queries
- Composite indexes support prefix matching: index `["orgId", "userId"]` works for queries on `orgId` alone or `orgId + userId`
- Order matters: put equality filters before range filters
- Maximum 16 indexes per table

---

## Queries (Read)

### Basic Query

```typescript
// convex/organizations.ts:106
export const getOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});
```

### Query with Index

```typescript
// convex/organizations.ts:130
export const getOrganizationBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
```

### Query with Authentication

```typescript
// convex/organizations.ts:145
export const getUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.tokenIdentifier;

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          role: membership.role,
          membershipId: membership._id,
        };
      })
    );

    return organizations.filter((org) => org !== null);
  },
});
```

### Query with Filters

```typescript
// convex/admin.ts:469
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Filter in-memory after collecting
    const allUsers = await ctx.db.query("users").collect();
    const activeUsers = allUsers.filter(
      (user) => user.lastLoginAt && user.lastLoginAt > oneDayAgo
    ).length;

    return {
      activeUsers,
      totalUsers: allUsers.length,
      // ... more metrics
    };
  },
});
```

### Query with Pagination

```typescript
// convex/admin.ts:31
export const searchUsers = query({
  args: {
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();

    // Client-side filtering
    let filteredUsers = allUsers;
    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      filteredUsers = allUsers.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower)
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
```

---

## Mutations (Write)

### Create Mutation

```typescript
// convex/organizations.ts:17
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if slug is already taken
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Organization slug already exists");
    }

    const now = Date.now();

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: userId,
      plan: args.plan || "free",
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner in team members
    await ctx.db.insert("teamMembers", {
      organizationId: orgId,
      userId,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Update user's organizationId
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        organizationId: orgId,
        updatedAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: orgId,
      action: "ORG_CREATED",
      resource: `organization/${orgId}`,
      resourceId: orgId,
      status: "success",
      metadata: { name: args.name, slug: args.slug },
      timestamp: now,
    });

    // Send email via scheduler
    if (identity.email) {
      await ctx.scheduler.runAfter(0, internal.emails.sendOrganizationCreatedEmail, {
        to: identity.email,
        organizationName: args.name,
        plan: args.plan || "free",
      });
    }

    return orgId;
  },
});
```

### Update Mutation

```typescript
// convex/organizations.ts:181
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if user is owner or admin
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Forbidden: Must be owner or admin");
    }

    const now = Date.now();

    // Update organization
    await ctx.db.patch(args.organizationId, {
      ...(args.name && { name: args.name }),
      ...(args.settings && { settings: args.settings }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: "ORG_UPDATED",
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      metadata: { name: args.name, settings: args.settings },
      timestamp: now,
    });

    return args.organizationId;
  },
});
```

### Delete Mutation (Soft Delete)

```typescript
// convex/organizations.ts:237
export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.tokenIdentifier;

    // Check if user is owner
    const org = await ctx.db.get(args.organizationId);
    if (!org || org.ownerId !== userId) {
      throw new Error("Forbidden: Must be owner to delete");
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(args.organizationId, {
      deletedAt: now,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      organizationId: args.organizationId,
      action: "ORG_DELETED",
      resource: `organization/${args.organizationId}`,
      resourceId: args.organizationId,
      status: "success",
      timestamp: now,
    });

    return true;
  },
});
```

---

## Actions (External APIs)

### Polar.sh Checkout Action

```typescript
// convex/billing.ts:60
import { Polar } from "@polar-sh/sdk";

export const createOrganizationCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    priceId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get organization via internal query
    const organization = await ctx.runQuery(
      internal.billing.getOrganizationForCheckout,
      {
        organizationId: args.organizationId,
        userId: identity.subject,
      }
    );

    if (!organization) {
      throw new Error("Organization not found or not authorized");
    }

    // Initialize Polar client
    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
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

### Rate Limiting Action

```typescript
// convex/rateLimit.ts
import { Redis } from "@upstash/redis";

export const checkRateLimit = action({
  args: {
    identifier: v.string(),
    endpoint: v.string(),
    limit: v.number(),
    window: v.number(),
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

---

## Internal Functions

### Internal Query

```typescript
// convex/organizations.ts:118
export const getOrganizationInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});
```

### Internal Mutation

```typescript
// convex/usageMetrics.ts:253
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
    const periodStart = getMonthStart(now);
    const periodEnd = getMonthEnd(now);

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
```

### Calling Internal Functions

```typescript
// From an action or HTTP handler
const result = await ctx.runQuery(internal.myModule.myInternalQuery, { ... });
const id = await ctx.runMutation(internal.myModule.myInternalMutation, { ... });
```

---

## Real-time Subscriptions

### Frontend Usage

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

function MyComponent() {
  // Real-time query - updates automatically
  const organizations = useQuery(api.organizations.getUserOrganizations);

  // Mutation
  const createOrg = useMutation(api.organizations.createOrganization);

  const handleCreate = async () => {
    await createOrg({
      name: "New Org",
      slug: "new-org",
    });
    // organizations will update automatically!
  };

  return (
    <div>
      {organizations?.map(org => (
        <div key={org._id}>{org.name}</div>
      ))}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
}
```

### Optimistic Updates

```typescript
const updateOrg = useMutation(api.organizations.updateOrganization).withOptimisticUpdate((localStore, args) => {
  // Update UI immediately
  const org = localStore.getQuery(api.organizations.getOrganization, {
    organizationId: args.organizationId
  });

  if (org) {
    localStore.setQuery(api.organizations.getOrganization, {
      organizationId: args.organizationId
    }, { ...org, name: args.name });
  }
});
```

---

## Scheduled Functions

### Define Cron Jobs

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at midnight UTC
crons.daily(
  "Reset monthly quotas",
  { hourUTC: 0, minuteUTC: 0 },
  internal.usageMetrics.resetMonthlyQuotas
);

// Run every hour
crons.hourly(
  "Aggregate metrics",
  { minuteUTC: 0 },
  internal.admin.aggregateMetrics
);

// Run every 15 minutes
crons.interval(
  "Health check",
  { minutes: 15 },
  internal.health.performHealthCheck
);

export default crons;
```

### Scheduler API

```typescript
// Schedule one-time function execution
await ctx.scheduler.runAfter(
  0, // milliseconds delay (0 = immediate)
  internal.emails.sendWelcomeEmail,
  { to: "user@example.com", name: "John" }
);

// Schedule for specific time
await ctx.scheduler.runAt(
  new Date("2025-12-01T00:00:00Z"),
  internal.reports.generateMonthlyReport,
  { month: "november" }
);
```

---

## Authentication

### Check Authentication

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthorized");
}

// Get user details
const userId = identity.tokenIdentifier; // Clerk user ID
const email = identity.email;
const name = identity.name;
```

### Require Super Admin

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

## Error Handling

### Try-Catch Pattern

```typescript
export const myMutation = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    try {
      // Perform operation
      const result = await ctx.db.insert("table", { ... });

      // Success audit log
      await ctx.db.insert("auditLogs", {
        userId: identity.tokenIdentifier,
        action: "OPERATION_SUCCESS",
        resource: `resource/${result}`,
        status: "success",
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      // Failure audit log
      await ctx.db.insert("auditLogs", {
        userId: identity.tokenIdentifier,
        action: "OPERATION_FAILED",
        resource: "resource/unknown",
        status: "failure",
        metadata: {
          error: error.message,
          stack: error.stack,
        },
        timestamp: Date.now(),
      });

      throw error; // Re-throw for client handling
    }
  },
});
```

### Custom Error Types

```typescript
class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Usage
if (!org) {
  throw new NotFoundError("Organization");
}

if (!isOwner) {
  throw new ForbiddenError("Must be owner to perform this action");
}
```

---

## Best Practices

### 1. Always Use Indexes

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

### 2. Validate Input

```typescript
export const createItem = mutation({
  args: {
    name: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Additional validation beyond type checking
    if (args.name.length === 0) {
      throw new Error("Name cannot be empty");
    }

    if (args.count < 0) {
      throw new Error("Count must be positive");
    }

    // Proceed with operation...
  },
});
```

### 3. Use Timestamps

```typescript
// Always include timestamps
const id = await ctx.db.insert("table", {
  ...data,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Update timestamp on patch
await ctx.db.patch(id, {
  ...updates,
  updatedAt: Date.now(),
});
```

### 4. Soft Delete

```typescript
// Don't hard delete - use soft delete
await ctx.db.patch(id, {
  deletedAt: Date.now(),
  updatedAt: Date.now(),
});

// Filter out deleted items
const active = await ctx.db
  .query("table")
  .filter((q) => q.eq(q.field("deletedAt"), undefined))
  .collect();
```

### 5. Audit Critical Actions

```typescript
// Always audit critical operations
await ctx.db.insert("auditLogs", {
  userId: identity.tokenIdentifier,
  organizationId: args.organizationId,
  action: "CRITICAL_ACTION",
  resource: `resource/${id}`,
  resourceId: id,
  status: "success",
  metadata: { details: "..." },
  timestamp: Date.now(),
});
```

### 6. Batch Operations

```typescript
// Use Promise.all for parallel operations
const enrichedMembers = await Promise.all(
  members.map(async (member) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", member.userId))
      .first();
    return { ...member, user };
  })
);
```

### 7. Pagination

```typescript
// Limit results for large datasets
const logs = await ctx.db
  .query("auditLogs")
  .order("desc")
  .take(100); // Only get first 100
```

### 8. Type Safety

```typescript
import { Id } from "./_generated/dataModel";

// Use generated types
function getOrgById(orgId: Id<"organizations">) {
  // TypeScript knows this is a valid org ID
}
```

### 9. Environment Variables

```typescript
// Always check environment variables exist
if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN not configured");
}

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});
```

### 10. Consistent Naming

```typescript
// Queries: get*, list*, search*
export const getUserOrganizations = query({ ... });
export const listFeatureFlags = query({ ... });
export const searchUsers = query({ ... });

// Mutations: create*, update*, delete*, add*, remove*
export const createOrganization = mutation({ ... });
export const updateTeamMemberRole = mutation({ ... });
export const removeTeamMember = mutation({ ... });

// Actions: *Action suffix or verb-noun pattern
export const createOrganizationCheckout = action({ ... });
export const checkRateLimit = action({ ... });
```

---

## Troubleshooting

### Common Issues

**"Function not found"**:
- Check function is exported properly
- Verify function name matches import

**"Index not found"**:
- Ensure index is defined in schema
- Wait for schema migration to complete
- Check index name and field names match exactly

**"Type mismatch"**:
- Validate args match schema validators
- Check `v.optional()` for optional fields
- Ensure IDs use `v.id("tableName")`

**"Unauthorized"**:
- Check `ctx.auth.getUserIdentity()` is called
- Verify Clerk is configured correctly
- Ensure auth middleware is applied

---

## Next Steps

- **[Admin Panel](./admin-panel-development.md)**: Super admin backend patterns
- **[Billing Integration](./billing-integration.md)**: Payment and subscription flows
- **[Security & Compliance](./security-compliance.md)**: Security best practices

---

**All examples are from the production Taskcoda codebase.**

---

## TypeScript Strict Typing Guidelines for Convex

### Prohibited Types

**NEVER use these types** in Convex functions:
- ❌ `any` - Defeats type safety entirely
- ❌ `null` - Use `undefined` instead
- ❌ `unknown` - Use specific types or Convex validators

### Convex-Specific Type Safety

1. **Context Types - Always Use Generated Types**
   ```typescript
   // ❌ BAD - Using any for context
   export const myQuery = query({
     handler: async (ctx: any) => {
       return await ctx.db.query("users").collect();
     },
   });

   // ✅ GOOD - Using proper Convex types
   import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
   
   export const myQuery = query({
     handler: async (ctx: QueryCtx) => {
       return await ctx.db.query("users").collect();
     },
   });
   ```

2. **Use Convex Validators for Arguments**
   ```typescript
   import { v } from "convex/values";

   // ❌ BAD - No validation
   export const createUser = mutation({
     handler: async (ctx, args: any) => {
       return await ctx.db.insert("users", args);
     },
   });

   // ✅ GOOD - With validators
   export const createUser = mutation({
     args: {
       name: v.string(),
       email: v.string(),
       age: v.optional(v.number()),
     },
     handler: async (ctx, args) => {
       // args is automatically typed!
       return await ctx.db.insert("users", {
         name: args.name,
         email: args.email,
         age: args.age,
       });
     },
   });
   ```

3. **Action Context Types**
   ```typescript
   // ❌ BAD
   export const sendEmail = action({
     handler: async (ctx: any, args: any) => {
       await ctx.runMutation(internal.emails.send, args);
     },
   });

   // ✅ GOOD
   export const sendEmail = action({
     args: {
       to: v.string(),
       subject: v.string(),
       body: v.string(),
     },
     handler: async (ctx: ActionCtx, args) => {
       await ctx.runMutation(internal.emails.send, {
         to: args.to,
         subject: args.subject,
         body: args.body,
       });
     },
   });
   ```

4. **Database Query Results**
   ```typescript
   import { Doc } from "./_generated/dataModel";

   // ❌ BAD - Untyped result
   export const getUser = query({
     args: { userId: v.id("users") },
     handler: async (ctx, args): Promise<any> => {
       return await ctx.db.get(args.userId);
     },
   });

   // ✅ GOOD - Properly typed
   export const getUser = query({
     args: { userId: v.id("users") },
     handler: async (ctx, args): Promise<Doc<"users"> | null> => {
       return await ctx.db.get(args.userId);
     },
   });
   ```

5. **Null vs Undefined in Convex**
   ```typescript
   // ❌ BAD - Using null
   export const schema = defineSchema({
     users: defineTable({
       email: v.union(v.string(), v.null()),
     }),
   });

   // ✅ GOOD - Using optional
   export const schema = defineSchema({
     users: defineTable({
       email: v.optional(v.string()),
     }),
   });
   ```

### Convex Validator Patterns

```typescript
import { v } from "convex/values";

// String validators
v.string()                     // Required string
v.optional(v.string())         // Optional string

// Number validators
v.number()                     // Any number
v.int64()                      // Integer
v.float64()                    // Float

// Boolean
v.boolean()

// ID references
v.id("tableName")              // Reference to table

// Arrays
v.array(v.string())            // Array of strings
v.array(v.object({            // Array of objects
  name: v.string(),
  age: v.number(),
}))

// Objects
v.object({
  name: v.string(),
  email: v.string(),
  metadata: v.optional(v.object({
    lastLogin: v.number(),
  })),
})

// Union types
v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("suspended")
)

// Any (avoid if possible!)
v.any()  // ❌ Try to avoid, use specific validator
```

### Type-Safe Mutations

```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const updateOrganization = mutation({
  args: {
    orgId: v.id("organizations"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      settings: v.optional(v.object({
        allowPublicJoin: v.boolean(),
        maxMembers: v.number(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // Fully typed args!
    const org = await ctx.db.get(args.orgId);
    if (!org) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(args.orgId, args.updates);
    return org;
  },
});
```

### HTTP Actions with Proper Types

```typescript
import { httpAction } from "./_generated/server";
import { ActionCtx } from "./_generated/server";

// ❌ BAD
http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx: any, request) => {
    // ...
  }),
});

// ✅ GOOD
http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx: ActionCtx, request: Request) => {
    const body = await request.json();
    
    // Validate body structure
    if (!isValidWebhookPayload(body)) {
      return new Response("Invalid payload", { status: 400 });
    }

    // Process with typed data
    await processWebhook(ctx, body as WebhookPayload);
    return new Response("OK", { status: 200 });
  }),
});

interface WebhookPayload {
  event: string;
  data: Record<string, string | number | boolean>;
}

function isValidWebhookPayload(body: unknown): body is WebhookPayload {
  return (
    typeof body === "object" &&
    body !== null &&
    "event" in body &&
    "data" in body
  );
}
```

### Code Review Checklist for Convex

Before committing Convex code:
- ✅ All query/mutation/action handlers use proper `Ctx` types
- ✅ All arguments use Convex validators
- ✅ No `any` types used
- ✅ No `null` values (use `undefined` or `v.optional()`)
- ✅ Return types are explicitly defined
- ✅ Database operations use generated `Doc` types
- ✅ HTTP actions properly type Request/Response
- ✅ Error handling doesn't catch with `any`

---

**Remember**: Convex provides excellent type safety through its generated types and validators. Always use them for bulletproof backend code.

