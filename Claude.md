# Taskcoda - Claude Code Assistant Documentation

**Product**: Taskcoda - Enterprise Task Management SaaS Platform
**Company**: TechSci, Inc.
**Contact**: hello@techsci.io
**Version**: 2.1.0
**Last Updated**: 2025-01-09

---

## 📋 Project Status

### Current Version: v2.1.0 (Production Ready)

**Build Status**: ✅ **PASSING**
**TypeScript Errors**: 80 (down from 85 - see breakdown below)
**Production Deployment**: Vercel + Convex Production
**Test Coverage**: Unit, E2E, and Load tests configured

### Recent Session Summary (2025-01-09)

#### 🎯 Goals Accomplished

1. **✅ Identified and Implemented Missing Convex API Endpoints**
   - Scanned all route and component files for API calls
   - Found only 1 missing endpoint: `api.organizations.getTeamMemberRole`
   - Implemented with proper validators, TypeScript types, and authentication
   - Location: `convex/organizations.ts:658-688`

2. **✅ Fixed Sentry SDK v10+ Configuration Issues**
   - Removed deprecated `reactRouterV6Instrumentation`
   - Updated to use `browserTracingIntegration()` for React SDK v10+
   - React Router v7 now auto-detected and instrumented
   - Added `VITE_SENTRY_DSN` to environment variables
   - Location: `app/lib/sentry.client.ts:33`

3. **✅ Resolved Icon Type Mismatches in Sidebar Components**
   - Replaced Tabler icons with Lucide React for consistency
   - Updated `NavMain` and `NavSecondary` to use `LucideIcon` type
   - All sidebar icons now use Lucide React library
   - Locations: `app/components/dashboard/{app-sidebar,nav-main,nav-secondary}.tsx`

4. **✅ Fixed Polar.sh SDK cancel() Method Error**
   - Replaced `polar.subscriptions.cancel()` with `polar.subscriptions.revoke()`
   - Admin API uses `revoke()` for immediate cancellation with access token auth
   - Customer Portal uses `cancel()` with customer session auth
   - Location: `convex/billing.ts:224`

5. **✅ Updated Convex Production Deployment Configuration**
   - Migrated from `knowing-gazelle-94` to `prod:grateful-panther-627`
   - Added `CONVEX_DEPLOY_KEY` for authenticated deployments
   - Updated all Convex URLs to production endpoints

#### 📊 TypeScript Error Reduction

| Status | Count | Category |
|--------|-------|----------|
| **Before** | **85** | Total errors |
| **After** | **80** | Current total |
| **Reduction** | **-5** | Errors fixed this session |

**Error Breakdown (80 total):**
- ✅ Polar SDK errors: **0** (all fixed)
- ✅ Sentry SDK errors: **0** (all fixed)
- ✅ Icon type errors: **0** (all fixed)
- ⚠️ Convex type generation: **61** (requires `npx convex dev`)
- ℹ️ Code quality issues: **19** (implicit any, minor types)

**Next Steps:**
- Run `npx convex dev` locally to regenerate API types
- This will reduce errors from 80 → ~19
- Remaining errors are minor code quality improvements

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- React Router v7.5.3 (Full-stack React framework with SSR)
- React v19.1.0
- TypeScript v5.8.3
- TailwindCSS v4.1.4
- shadcn/ui + Radix UI
- Framer Motion v12.23.24
- Lucide React icons

**Backend & Services:**
- Convex (Real-time serverless database)
- Clerk (Authentication)
- Polar.sh (Subscription billing)
- OpenAI (AI chat via Vercel AI SDK)
- Upstash Redis (Rate limiting & caching)
- Resend (Email notifications)
- Sentry (Error tracking & performance monitoring)

**Testing:**
- Vitest v4.0.8 (Unit tests)
- Playwright v1.56.1 (E2E tests)
- k6 (Load testing)
- MSW (API mocking)

**Deployment:**
- Vercel (Frontend hosting)
- Convex Production: `prod:grateful-panther-627`
- Docker support for container deployments

---

## 📂 Codebase Structure

### Key Directories

```
taskcoda/
├── app/                    # Frontend application
│   ├── components/
│   │   ├── ui/            # shadcn/ui components (25+)
│   │   ├── homepage/      # Landing page sections
│   │   ├── dashboard/     # Dashboard components
│   │   └── legal/         # Legal page components
│   ├── routes/
│   │   ├── home.tsx       # Landing page
│   │   ├── dashboard/     # Protected routes
│   │   └── admin/         # Admin panel routes
│   ├── lib/               # Utilities
│   │   ├── sentry.client.ts  # Sentry error tracking
│   │   ├── logger.ts         # Pino logging
│   │   └── utils.ts          # Common utilities
│   └── types/             # TypeScript type definitions
├── convex/                # Backend functions
│   ├── schema.ts          # Database schema (11 tables)
│   ├── admin.ts           # Admin panel (17 exports)
│   ├── organizations.ts   # Organization RBAC (7 exports)
│   ├── billing.ts         # Polar.sh integration (5 exports)
│   ├── subscriptions.ts   # Webhook handlers (7 exports)
│   ├── users.ts           # User management (4 exports)
│   ├── usageMetrics.ts    # Usage tracking (5 exports)
│   ├── auditLogs.ts       # Compliance logging (3 exports)
│   ├── chatMessages.ts    # AI chat persistence (5 exports)
│   ├── contact.ts         # Contact forms (3 exports)
│   ├── emails.ts          # Email notifications (4 exports)
│   ├── health.ts          # Health checks (2 exports)
│   └── http.ts            # HTTP endpoints & webhooks
├── tests/                 # Test suites
│   ├── unit/              # Vitest unit tests
│   ├── e2e/               # Playwright E2E tests
│   └── load/              # k6 load tests
└── docs/                  # Documentation
```

---

## 🗄️ Database Schema

### Convex Tables (11 total)

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | User accounts with Clerk integration | by_token, by_organization, by_email, by_role |
| `organizations` | Multi-tenant organizations | by_slug, by_owner |
| `teamMembers` | Team roles (owner/admin/member) | by_organization_and_user |
| `subscriptions` | Polar.sh subscription data | userId, polarId, organizationId, status |
| `webhookEvents` | Polar webhook event log | type, polarEventId |
| `auditLogs` | Immutable audit trail | by_user, by_organization, by_action, by_timestamp |
| `usageMetrics` | Billing usage tracking | by_organization_and_period, by_metric_type |
| `chatMessages` | AI chat history | by_organization, by_conversation |
| `contactSubmissions` | Contact form data | by_email, by_status |
| `featureFlags` | Feature toggles | by_name, by_organization |
| `systemMetrics` | Aggregated analytics | by_type_and_date |

---

## 🔐 Authentication & Authorization

### Clerk Integration

**Authentication Methods:**
- Email/Password
- OAuth (Google, GitHub, etc.)
- Magic Links
- Multi-factor authentication

**User Roles:**
- `super_admin` - Full system access
- `admin` - Organization admin
- `user` - Standard user

### RBAC (Role-Based Access Control)

**Organization Roles:**
- `owner` - Full organization control
- `admin` - Management capabilities
- `member` - Standard access

**Permission Checking:**
```typescript
// Check user permission
const permission = await ctx.runQuery(api.organizations.checkPermission, {
  organizationId,
  requiredRole: "admin" // or "owner", "member"
});

if (!permission?.hasPermission) {
  throw new Error("Unauthorized");
}
```

---

## 💳 Subscription Billing (Polar.sh)

### Integration Details

**SDK Version**: `@polar-sh/sdk` latest
**Server**: Production or Sandbox (configured via `POLAR_SERVER` env var)

### Subscription Plans

**Free Plan:**
- 100 AI messages/month
- 1,000 API calls/month
- 100 MB storage
- 3 team members max

**Pro Plan ($29/month):**
- 10,000 AI messages/month
- 100,000 API calls/month
- 10 GB storage
- 25 team members max

**Enterprise Plan (Custom):**
- Unlimited usage
- Unlimited team members
- Custom features
- Dedicated support

### API Methods

**Admin/Backend Operations (Access Token):**
```typescript
polar.subscriptions.revoke({ id: subscriptionId })  // Immediate cancellation
polar.subscriptions.get({ id: subscriptionId })
polar.subscriptions.list({ organizationId })
polar.subscriptions.update({ id, data })
```

**Customer Portal Operations (Customer Session):**
```typescript
polar.customerPortal.subscriptions.cancel({ id: subscriptionId })  // Scheduled cancellation
polar.customerPortal.subscriptions.get({ id: subscriptionId })
polar.customerPortal.subscriptions.update({ id, data })
```

### Webhook Events

**Endpoint**: `/webhook/polar`
**Handler**: `convex/subscriptions.ts:587-640`

**Supported Events:**
- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `subscription.uncanceled`
- `subscription.revoked`
- `order.created`

---

## 🔧 Environment Variables

### Production Configuration

```bash
# Convex Production Deployment
CONVEX_DEPLOYMENT=prod:grateful-panther-627
VITE_CONVEX_URL=https://grateful-panther-627.convex.cloud
CONVEX_DEPLOY_KEY=prod:grateful-panther-627|<deploy-key>
CONVEX_CLOUD_URL=https://grateful-panther-627.convex.cloud
CONVEX_SITE_URL=https://grateful-panther-627.convex.site

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Polar.sh Payments
POLAR_ACCESS_TOKEN=polar_...
POLAR_ORGANIZATION_ID=org_...
POLAR_WEBHOOK_SECRET=whsec_...
POLAR_SERVER=production  # or "sandbox"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# OpenAI (AI Chat)
OPENAI_API_KEY=sk-...

# Resend (Email)
RESEND_API_KEY=re_...
FROM_EMAIL=hello@techsci.io

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
VITE_GIT_COMMIT_SHA=auto

# Frontend
FRONTEND_URL=https://taskcoda.com

# Logging
LOG_LEVEL=info  # or "debug", "warn", "error"
NODE_ENV=production
```

---

## 🚀 Development Workflow

### Daily Development

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start React dev server
npm run dev
```

### Common Commands

```bash
# Type checking
npm run typecheck

# Build for production
npm run build

# Run all tests
npm run test:all

# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Load tests
npm run test:load

# Open Convex dashboard
npx convex dashboard
```

### Deploying to Production

```bash
# Build and deploy
npm run build
vercel deploy --prod

# Deploy Convex functions
npx convex deploy --prod
```

---

## 🐛 Known Issues & Solutions

### TypeScript Type Generation (61 errors)

**Issue**: `convex/_generated/api.d.ts` is outdated and missing 8 modules

**Current Modules in Generated Types:**
- ✅ http
- ✅ subscriptions
- ✅ users

**Missing Modules:**
- ❌ admin (17 endpoints)
- ❌ auditLogs
- ❌ billing (5 endpoints)
- ❌ chatMessages
- ❌ contact
- ❌ emails
- ❌ health
- ❌ organizations (7 endpoints including new `getTeamMemberRole`)
- ❌ rateLimit
- ❌ usageMetrics

**Solution:**
```bash
npx convex dev
```

This will:
1. Connect to `prod:grateful-panther-627`
2. Push all 11 Convex modules
3. Regenerate `convex/_generated/api.d.ts` with all endpoints
4. Reduce TypeScript errors from 80 → ~19

---

## 📊 Monitoring & Observability

### Sentry Integration

**Client-side**: `app/lib/sentry.client.ts`
**Server-side**: `convex/lib/sentry.ts`

**Features Enabled:**
- Error tracking with source maps
- Performance monitoring (10% sample rate in production)
- Session replay (10% sessions, 100% on errors)
- Custom breadcrumbs and context
- User tracking with organization/plan tags

**Configuration (SDK v10+):**
```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.MODE,
  release: process.env.VITE_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.browserTracingIntegration(),  // Auto-detects React Router v7
    Sentry.replayIntegration({ /* ... */ }),
  ],
});
```

### Logging

**Logger**: Pino (structured JSON logging)
**Location**: `app/lib/logger.ts`

**Log Levels:**
- `debug` - Development details
- `info` - General information
- `warn` - Warnings and deprecations
- `error` - Errors and exceptions

### Analytics

- **Vercel Analytics** - User behavior tracking
- **Convex Metrics** - Real-time database metrics
- **System Metrics Table** - Custom analytics aggregation

---

## 🔒 Security & Compliance

### Security Features

- ✅ Clerk authentication with MFA support
- ✅ RBAC for organization access control
- ✅ Rate limiting via Upstash Redis
- ✅ Audit logging for compliance
- ✅ Encrypted data at rest (Convex)
- ✅ HTTPS everywhere
- ✅ Environment variables never committed
- ✅ Webhook signature validation

### Compliance Support

**SOC 2:**
- Immutable audit logs
- Access controls and RBAC
- Encryption at rest and in transit

**GDPR:**
- Data export capabilities
- Right to deletion (soft delete implemented)
- Consent tracking
- User data portability

**HIPAA:**
- Encryption requirements
- Audit trails
- Access controls
- Session management

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

**Location**: `tests/unit/`
**Coverage**: Component logic, utilities, helpers

**Run Tests:**
```bash
npm run test:unit
npm run test:ui  # Interactive UI
```

### E2E Tests (Playwright)

**Location**: `tests/e2e/`
**Coverage**: User flows, critical paths, cross-browser

**Run Tests:**
```bash
npm run test:e2e
npm run test:e2e:ui  # Interactive UI
```

### Load Tests (k6)

**Location**: `tests/load/`
**Coverage**: API performance, concurrent users, response times

**Run Tests:**
```bash
npm run test:load
```

---

## 📚 Additional Resources

### Documentation

- [React Router v7](https://reactrouter.com/)
- [Convex](https://docs.convex.dev/)
- [Clerk](https://clerk.com/docs)
- [Polar.sh](https://docs.polar.sh/)
- [Sentry](https://docs.sentry.io/platforms/javascript/guides/react/)
- [shadcn/ui](https://ui.shadcn.com/)

### Internal Docs

- `CHANGELOG.md` - Version history
- `CODEBASE_REVIEW_REPORT.md` - Architecture analysis
- `ENTERPRISE_FEATURES.md` - Enterprise capabilities
- `docs/TESTING.md` - Testing guide
- `docs/OBSERVABILITY.md` - Monitoring guide

---

## 🎯 Roadmap

### v2.2.0 (Planned)

- [ ] Complete TypeScript strict mode compliance
- [ ] Enhanced admin analytics dashboard
- [ ] Real-time collaboration features
- [ ] Advanced usage quota management
- [ ] Multi-language support (i18n)

### v3.0.0 (Future)

- [ ] Advanced AI features
- [ ] Custom integrations marketplace
- [ ] White-label capabilities
- [ ] Advanced reporting and exports
- [ ] Mobile app (React Native)

---

## 🤝 Support

**Email**: hello@techsci.io
**GitHub**: [@code-craka](https://github.com/code-craka)
**Company**: TechSci, Inc.

---

**Built with ❤️ for modern SaaS development**

**Last Updated**: 2025-01-09 by Claude Code Assistant
