# Enterprise SaaS Features

This document outlines all enterprise-grade features implemented in this React SaaS starter.

## 🚀 Implemented Features

### 1. Multi-Tenancy & Organization Management

**Location:** `convex/organizations.ts`, `convex/schema.ts`

Complete organization and team management system with role-based access control.

#### Features:
- ✅ Organization creation and management
- ✅ Team member invitations
- ✅ Role-based permissions (Owner, Admin, Member)
- ✅ Invitation acceptance workflow
- ✅ Team member management (add/remove)
- ✅ Organization settings and metadata

#### Database Schema:
```typescript
organizations: {
  name, slug, ownerId, plan, subscriptionId,
  settings, metadata, createdAt, updatedAt
}

teamMembers: {
  organizationId, userId, role, invitedBy,
  status (pending/active/suspended), joinedAt
}
```

#### API Functions:
```typescript
// Mutations
createOrganization({ name, slug, plan })
updateOrganization({ organizationId, name, settings })
deleteOrganization({ organizationId }) // Soft delete
inviteTeamMember({ organizationId, userEmail, role })
acceptTeamInvitation({ membershipId })
removeTeamMember({ membershipId })
updateTeamMemberRole({ membershipId, role })

// Queries
getOrganization({ organizationId })
getUserOrganizations() // Returns all orgs user belongs to
getTeamMembers({ organizationId })
checkPermission({ organizationId, requiredRole })
```

---

### 2. Audit Logging System

**Location:** `convex/auditLogs.ts`

Enterprise-grade immutable audit trail for compliance (SOC 2, GDPR, HIPAA).

#### Features:
- ✅ Immutable audit logs for all critical actions
- ✅ User, organization, and resource tracking
- ✅ Success/failure status tracking
- ✅ IP address and user agent capture
- ✅ Metadata storage for context
- ✅ Time-based filtering
- ✅ Export functionality for compliance

#### Database Schema:
```typescript
auditLogs: {
  userId, organizationId, action, resource, resourceId,
  status, metadata, ipAddress, userAgent, timestamp
}
```

#### Audit Actions:
```typescript
// User actions
USER_CREATED, USER_UPDATED, USER_DELETED, USER_LOGIN, USER_LOGOUT

// Organization actions
ORG_CREATED, ORG_UPDATED, ORG_DELETED

// Team actions
TEAM_MEMBER_INVITED, TEAM_MEMBER_JOINED, TEAM_MEMBER_REMOVED

// Subscription actions
SUBSCRIPTION_CREATED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_CANCELED

// Data actions
DATA_EXPORTED, DATA_IMPORTED, DATA_DELETED

// Security actions
PASSWORD_CHANGED, MFA_ENABLED, API_KEY_CREATED

// AI actions
AI_CHAT_MESSAGE, AI_GENERATION_STARTED, AI_GENERATION_COMPLETED
```

#### API Functions:
```typescript
// Mutations
createAuditLog({ action, resource, status, metadata, organizationId })

// Queries
getAuditLogsByUser({ userId, limit })
getAuditLogsByOrganization({ organizationId, limit })
getAuditLogsByAction({ action, limit })
getAuditLogsByTimeRange({ startTime, endTime, organizationId })
getAuditLogStats({ organizationId, days })
exportAuditLogs({ organizationId, startTime, endTime })
```

#### Usage Example:
```typescript
import { api } from "convex/_generated/api";
import { AUDIT_ACTIONS } from "convex/auditLogs";

// Log a critical action
await createAuditLog({
  action: AUDIT_ACTIONS.USER_CREATED,
  resource: "user/123",
  resourceId: "123",
  status: "success",
  organizationId: org._id,
  metadata: { email: "user@example.com" }
});
```

---

### 3. Rate Limiting

**Location:** `convex/rateLimit.ts`

Distributed rate limiting using Upstash Redis with sliding window algorithm.

#### Features:
- ✅ Per-user and per-organization rate limits
- ✅ Sliding window algorithm for accuracy
- ✅ Plan-based limits (Free, Pro, Enterprise)
- ✅ Fail-open behavior (if Redis is down)
- ✅ Rate limit headers in responses
- ✅ Customizable limits per endpoint

#### Configuration:
```typescript
// Environment variables required
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### Pre-defined Limits:
```typescript
CHAT_FREE: 10 messages / hour
CHAT_PRO: 100 messages / hour
CHAT_ENTERPRISE: 1000 messages / hour

API_FREE: 100 calls / day
API_PRO: 10,000 calls / day
API_ENTERPRISE: 100,000 calls / day

AUTH_LOGIN: 5 attempts / 15 minutes
```

#### API Functions:
```typescript
checkRateLimit({ key, limit, window, prefix })
checkRateLimitSimple({ key, limit, window }) // Faster, token bucket
getRateLimitForPlan(plan, type) // Get limits for plan
resetRateLimit(key, prefix) // Admin function
getRateLimitStatus(key) // Check without incrementing
```

#### Response Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200
Retry-After: 3600 (if rate limited)
```

---

### 4. Usage Metering & Quotas

**Location:** `convex/usageMetrics.ts`

Track consumption for billing and quota enforcement.

#### Features:
- ✅ Per-organization usage tracking
- ✅ Monthly billing periods
- ✅ Multiple metric types (AI messages, API calls, storage)
- ✅ Quota enforcement based on plan
- ✅ Usage history and trending
- ✅ Per-user breakdown
- ✅ Export for billing integration

#### Database Schema:
```typescript
usageMetrics: {
  organizationId, userId, metricType, quantity,
  metadata, periodStart, periodEnd, timestamp
}
```

#### Metric Types:
```typescript
AI_MESSAGES: "ai_messages"
API_CALLS: "api_calls"
STORAGE_MB: "storage_mb"
TEAM_MEMBERS: "team_members"
WEBHOOK_CALLS: "webhook_calls"
EXPORTS: "exports"
```

#### Quota Limits by Plan:
```typescript
FREE:
  - 100 AI messages/month
  - 1,000 API calls/month
  - 100 MB storage
  - 3 team members

PRO:
  - 10,000 AI messages/month
  - 100,000 API calls/month
  - 10 GB storage
  - 25 team members

ENTERPRISE:
  - Unlimited
```

#### API Functions:
```typescript
// Mutations
recordUsage({ organizationId, metricType, quantity, metadata })

// Queries
getCurrentUsage({ organizationId, metricType })
getUsageHistory({ organizationId, metricType, months })
checkQuota({ organizationId, metricType })
getUsageByUser({ organizationId, metricType })
exportUsageForBilling({ organizationId, periodStart, periodEnd })
```

#### Usage Example:
```typescript
// Check if quota available
const quota = await checkQuota({
  organizationId: org._id,
  metricType: METRIC_TYPES.AI_MESSAGES
});

if (!quota.hasQuota) {
  throw new Error(`Quota exceeded: ${quota.used}/${quota.limit}`);
}

// Record usage
await recordUsage({
  organizationId: org._id,
  metricType: METRIC_TYPES.AI_MESSAGES,
  quantity: 1,
  metadata: { tokensUsed: 150 }
});
```

---

### 5. Chat Message Persistence

**Location:** `convex/chatMessages.ts`

Persistent chat history for compliance and user experience.

#### Features:
- ✅ Save all AI conversations
- ✅ Group by conversation ID
- ✅ Soft delete (compliance)
- ✅ Export for GDPR
- ✅ Organization-scoped access
- ✅ Conversation history

#### Database Schema:
```typescript
chatMessages: {
  organizationId, userId, role, content,
  conversationId, metadata, timestamp, deletedAt
}
```

#### API Functions:
```typescript
// Mutations
saveMessage({ organizationId, userId, role, content, conversationId })
deleteConversation({ conversationId }) // Soft delete

// Queries
getConversationMessages({ conversationId, limit })
getUserConversations({ limit })
getOrganizationMessages({ organizationId, limit })
exportChatHistory({ organizationId, startTime, endTime })
```

---

### 6. Enhanced Chat Endpoint

**Location:** `convex/http.ts`

Production-ready AI chat endpoint with enterprise features.

#### Features:
- ✅ Authentication required (Bearer token)
- ✅ Organization membership check
- ✅ Rate limiting (plan-based)
- ✅ Quota enforcement (plan-based)
- ✅ Usage tracking (tokens, messages)
- ✅ Audit logging (start, complete, errors)
- ✅ Chat history persistence
- ✅ Comprehensive error handling
- ✅ Rate limit headers
- ✅ Quota headers

#### Request:
```typescript
POST /api/chat
Headers:
  Authorization: Bearer <clerk-token>
  Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "conversationId": "optional-conversation-id"
}
```

#### Response Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1672531200
X-Quota-Used: 5
X-Quota-Limit: 100
X-Quota-Remaining: 95
```

#### Error Responses:
```typescript
401 Unauthorized: Missing or invalid auth token
403 Forbidden: No organization membership
404 Not Found: Organization not found
429 Rate Limit: Rate limit or quota exceeded
500 Server Error: Internal error
```

---

## 🔧 Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
# Existing variables
CONVEX_DEPLOYMENT=your-deployment
VITE_CONVEX_URL=your-convex-url
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
OPENAI_API_KEY=your-openai-key

# New enterprise variables
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
VITE_SENTRY_DSN=your-sentry-dsn (optional)
```

### 2. Database Migration

The Convex schema will auto-migrate when you run:

```bash
npx convex dev
```

### 3. First Organization Setup

After user signs up, they need to create an organization:

```typescript
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

const createOrg = useMutation(api.organizations.createOrganization);

await createOrg({
  name: "My Company",
  slug: "my-company",
  plan: "pro"
});
```

---

## 📊 Monitoring & Compliance

### Audit Log Export

For SOC 2 compliance, export audit logs regularly:

```typescript
const logs = await exportAuditLogs({
  organizationId: org._id,
  startTime: monthStart,
  endTime: monthEnd
});

// Save to S3, send to compliance system, etc.
```

### Usage Reporting

For billing and analytics:

```typescript
const usage = await exportUsageForBilling({
  organizationId: org._id,
  periodStart: monthStart,
  periodEnd: monthEnd
});

// Metrics aggregated by type with full details
```

### Rate Limit Monitoring

Monitor rate limit hits in audit logs:

```typescript
const rateLimitFailures = await getAuditLogsByAction({
  action: "AI_CHAT_MESSAGE",
  limit: 1000
}).then(logs =>
  logs.filter(log =>
    log.status === "failure" &&
    log.metadata?.reason === "rate_limit_exceeded"
  )
);
```

---

## 🔒 Security Features

### Implemented:
- ✅ Authentication required (Clerk)
- ✅ Authorization (RBAC)
- ✅ Rate limiting (DDoS protection)
- ✅ Audit logging (compliance)
- ✅ Input validation (Zod schemas)
- ✅ Soft deletes (data retention)
- ✅ Organization isolation
- ✅ Fail-open rate limiting (availability)

### Recommended Additions:
- [ ] CSRF protection (handled by Clerk)
- [ ] Content Security Policy headers
- [ ] Input sanitization for XSS
- [ ] SQL injection protection (N/A - using Convex)
- [ ] Encrypted fields for PII
- [ ] Data residency configuration
- [ ] Backup automation

---

## 🎯 Next Steps

### Phase 1: UI Components
- [ ] Organization switcher component
- [ ] Team management dashboard
- [ ] Usage dashboard with charts
- [ ] Audit log viewer (admin)
- [ ] Quota warnings/alerts

### Phase 2: Admin Panel
- [ ] User management (search, view, impersonate)
- [ ] Organization management
- [ ] Usage analytics
- [ ] System health monitoring
- [ ] Feature flags

### Phase 3: Advanced Features
- [ ] Email notifications (welcome, invites, quotas)
- [ ] Webhook delivery system
- [ ] API keys for developers
- [ ] Data export automation (GDPR)
- [ ] Backup system (S3)

### Phase 4: Compliance
- [ ] GDPR compliance checklist
- [ ] SOC 2 preparation
- [ ] Privacy policy generator
- [ ] Terms of service
- [ ] Cookie consent

---

## 📚 API Reference

### Organization Management

```typescript
// Create organization
const org = await createOrganization({
  name: "Acme Corp",
  slug: "acme-corp",
  plan: "pro"
});

// Invite team member
await inviteTeamMember({
  organizationId: org._id,
  userEmail: "user@example.com",
  role: "member" // or "admin"
});

// Check permissions
const { hasPermission, role } = await checkPermission({
  organizationId: org._id,
  requiredRole: "admin"
});
```

### Audit Logging

```typescript
// Create audit log
await createAuditLog({
  action: AUDIT_ACTIONS.DATA_EXPORTED,
  resource: "data/export",
  status: "success",
  organizationId: org._id,
  metadata: { recordCount: 1000, format: "csv" }
});

// Get organization audit history
const logs = await getAuditLogsByOrganization({
  organizationId: org._id,
  limit: 100
});
```

### Usage Tracking

```typescript
// Record usage
await recordUsage({
  organizationId: org._id,
  metricType: METRIC_TYPES.API_CALLS,
  quantity: 1
});

// Check quota
const quota = await checkQuota({
  organizationId: org._id,
  metricType: METRIC_TYPES.AI_MESSAGES
});

console.log(`Used: ${quota.used}/${quota.limit} (${quota.percentage}%)`);
```

---

## 🐛 Troubleshooting

### Rate Limiting Not Working
- Verify Upstash Redis credentials in `.env.local`
- Check Redis connectivity: `curl $UPSTASH_REDIS_REST_URL`
- Review rate limit logs in Convex dashboard

### Quota Not Enforced
- Check organization plan: `await getOrganization({ organizationId })`
- Verify billing period dates are correct
- Review usage metrics: `await getCurrentUsage({ organizationId })`

### Audit Logs Not Appearing
- Ensure `createAuditLog` is called after successful operations
- Check if user is authenticated (required for audit logs)
- Review Convex logs for errors

---

## 📖 Architecture Decisions

### Why Upstash Redis?
- Serverless (no infrastructure management)
- HTTP REST API (works with Convex actions)
- Global replication
- Generous free tier

### Why Not PostgreSQL?
- Convex provides real-time reactivity
- Simpler architecture (no ORM)
- Better developer experience
- Auto-scaling built-in
- For complex analytics, sync to PostgreSQL warehouse later

### Why Soft Deletes?
- Compliance requirements (audit trail)
- Data recovery (accidental deletions)
- Historical analysis
- GDPR right to be forgotten (can hard delete later)

---

## 🤝 Contributing

When adding new features:

1. **Always add audit logging** for critical operations
2. **Implement rate limiting** for public endpoints
3. **Track usage** for billable resources
4. **Update this documentation**
5. **Add tests** (coming soon)

---

## 📝 License

[Your License Here]

---

## 🆘 Support

For questions or issues:
- GitHub Issues: [your-repo/issues]
- Email: [your-email]
- Docs: [your-docs-url]
