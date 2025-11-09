# Security & Compliance

> **Skill**: Security best practices and compliance features in Taskcoda
> **Focus**: Authentication, authorization, audit logging, data protection, compliance (SOC 2, GDPR, HIPAA)
> **Last Updated**: 2025-11-09

---

## Authentication (Clerk)

### Secure Authentication

```typescript
// All protected routes check authentication
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthorized");
}
```

### Password Security

- Clerk handles all password hashing (bcrypt)
- Multi-factor authentication (MFA) available
- Passwordless login options (magic links, OAuth)
- Session management with secure cookies
- JWT tokens with expiration

---

## Authorization (RBAC)

### Role Hierarchy

```
super_admin  (Global system access)
  └── admin  (Organization-wide admin)
      └── user  (Standard user)

Organization roles:
  owner  (Full organization control)
  └── admin  (Manage members, settings)
      └── member  (Basic access)
```

### Permission Checks

From `convex/organizations.ts:615`:

```typescript
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

### Super Admin Protection

From `convex/admin.ts:9`:

```typescript
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

### RBAC Best Practices

1. **Always check permissions** before allowing operations
2. **Use role hierarchy** (owner > admin > member)
3. **Prevent privilege escalation** (admins can't create owners)
4. **Protect super admin** (can't suspend/delete super admins)
5. **Verify membership status** (must be "active")

---

## Audit Logging

### Immutable Audit Trails

Every critical action creates an audit log:

```typescript
await ctx.db.insert("auditLogs", {
  userId: identity.tokenIdentifier,
  organizationId: args.organizationId,
  action: "ORG_CREATED",
  resource: `organization/${orgId}`,
  resourceId: orgId,
  status: "success",
  metadata: { name: args.name, slug: args.slug },
  ipAddress: request.headers.get("x-forwarded-for"),
  userAgent: request.headers.get("user-agent"),
  timestamp: Date.now(),
});
```

### Audit Actions

From `convex/auditLogs.ts`:

```typescript
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
// Get organization audit logs
const logs = await ctx.db
  .query("auditLogs")
  .withIndex("by_organization", (q) => q.eq("organizationId", orgId))
  .order("desc")
  .take(100);

// Get failed actions
const failures = await ctx.db
  .query("auditLogs")
  .filter((q) => q.eq(q.field("status"), "failure"))
  .order("desc")
  .take(50);

// Get user activity
const userLogs = await ctx.db
  .query("auditLogs")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .order("desc")
  .take(100);
```

### Audit Log Retention

- **Never delete audit logs** (immutable)
- Archive old logs if needed (export to cold storage)
- Keep at least 7 years for compliance (SOC 2, HIPAA)

---

## Data Protection

### Encryption

- **At rest**: Convex encrypts all data at rest (AES-256)
- **In transit**: All connections use TLS 1.3
- **Credentials**: Environment variables never committed to git
- **API keys**: Stored in environment variables only

### Soft Delete

Never hard delete data - use soft delete:

```typescript
// Soft delete
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

### PII Protection

- Email addresses encrypted at rest
- No sensitive data in logs
- Data export capabilities (GDPR compliance)
- Right to deletion implemented (soft delete)

---

## Input Validation

### Schema Validation

```typescript
import { v } from "convex/values";

export const createItem = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Additional validation beyond type checking
    if (!args.email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (args.count < 0) {
      throw new Error("Count must be positive");
    }

    if (args.name.length > 255) {
      throw new Error("Name too long");
    }

    // Proceed with operation...
  },
});
```

### Sanitization

```typescript
// Sanitize user input
const sanitizedName = args.name.trim().slice(0, 255);

// Prevent XSS in stored data
const sanitizedContent = args.content
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
```

---

## Rate Limiting

### Upstash Redis Rate Limiting

From `convex/rateLimit.ts`:

```typescript
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

### Plan-Based Limits

```typescript
const rateLimits = {
  free: {
    api: { limit: 100, window: 3600 }, // 100/hour
    ai_chat: { limit: 10, window: 3600 }, // 10/hour
  },
  pro: {
    api: { limit: 10000, window: 3600 },
    ai_chat: { limit: 1000, window: 3600 },
  },
  enterprise: {
    api: { limit: Infinity, window: 3600 },
    ai_chat: { limit: Infinity, window: 3600 },
  },
};
```

---

## Error Handling

### Secure Error Messages

```typescript
// ✅ Good - doesn't leak sensitive info
throw new Error("Invalid credentials");

// ❌ Bad - leaks database structure
throw new Error("User with email john@example.com not found in users table");
```

### Error Logging

From `app/lib/logger.ts`:

```typescript
export const logError = {
  api: (endpoint: string, method: string, statusCode: number, error: Error) => {
    logger.error({
      event: "api_error",
      endpoint,
      method,
      statusCode,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }, "API error occurred");
  },

  database: (operation: string, table: string, error: Error) => {
    logger.error({
      event: "database_error",
      operation,
      table,
      error: error.message,
    }, "Database error occurred");
  },
};
```

### Sentry Integration

```typescript
// app/lib/sentry.client.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## Compliance Features

### SOC 2 Compliance

✅ **Access Controls**:
- RBAC with role hierarchy
- Super admin for system-wide access
- Organization-level isolation

✅ **Audit Logging**:
- Immutable audit trails
- All critical actions logged
- Failed action tracking

✅ **Data Protection**:
- Encryption at rest and in transit
- Secure credential storage
- Regular security reviews

✅ **Monitoring**:
- Sentry error tracking
- Structured logging (Pino)
- System health dashboard

### GDPR Compliance

✅ **Right to Access**:
```typescript
// Export user data
export const exportUserData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").filter(...).first();
    const organizations = await ctx.db.query("teamMembers").filter(...).collect();
    const usageMetrics = await ctx.db.query("usageMetrics").filter(...).collect();

    return {
      user,
      organizations,
      usageMetrics,
      // ... all user data
    };
  },
});
```

✅ **Right to Deletion**:
- Soft delete implemented
- Data can be hard deleted on request
- Cascading deletion for related records

✅ **Consent Tracking**:
- Cookie consent (app/routes/cookies.tsx)
- Privacy policy (app/routes/privacy.tsx)
- Terms of service (app/routes/terms.tsx)

### HIPAA Compliance

✅ **Access Controls**: RBAC + audit logging
✅ **Encryption**: At rest + in transit
✅ **Audit Trails**: Immutable logs
✅ **Data Integrity**: Soft delete, versioning

---

## Security Checklist

### Authentication & Authorization
- [x] All routes check authentication
- [x] RBAC enforced on all mutations
- [x] Super admin protected
- [x] Session management with Clerk
- [x] JWT tokens with expiration

### Data Protection
- [x] Encryption at rest (Convex)
- [x] TLS for all connections
- [x] Environment variables for secrets
- [x] Soft delete for compliance
- [x] PII protection

### Input Validation
- [x] Schema validation with Convex validators
- [x] Additional business logic validation
- [x] Sanitization of user input
- [x] Length limits on text fields

### Audit & Monitoring
- [x] Audit logs for all critical actions
- [x] Failed action tracking
- [x] Structured logging (Pino)
- [x] Error tracking (Sentry)
- [x] System health monitoring

### Rate Limiting
- [x] Upstash Redis rate limiting
- [x] Plan-based limits
- [x] Per-user and per-org limits

### Compliance
- [x] SOC 2 features
- [x] GDPR features
- [x] HIPAA features
- [x] Legal pages (Privacy, Terms, AUP)
- [x] Cookie consent

---

## Security Best Practices

1. **Never trust user input** - Always validate and sanitize
2. **Use prepared statements** - Convex handles this automatically
3. **Implement RBAC** - Check permissions before every operation
4. **Audit everything** - Log all critical actions
5. **Rate limit** - Prevent abuse and DDoS
6. **Encrypt secrets** - Use environment variables
7. **Soft delete** - Keep data for compliance
8. **Monitor errors** - Use Sentry for real-time alerts
9. **Update dependencies** - Regular security patches
10. **Follow OWASP Top 10** - Prevent common vulnerabilities

---

**Taskcoda is built with security and compliance as top priorities.**

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

