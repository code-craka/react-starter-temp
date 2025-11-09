# Taskcoda - Project Documentation

**Product**: Taskcoda - Enterprise Task Management SaaS Platform
**Company**: TechSci, Inc.
**Contact**: hello@techsci.io
**Version**: 1.0.0

---

## Project Overview

### Product Description
Taskcoda is a modern, production-ready task management SaaS platform designed for teams and organizations. Built with enterprise-grade features including multi-tenancy, RBAC, usage metering, audit logging, and comprehensive admin capabilities.

###Key Features
- **Multi-Tenancy**: Organization-based isolation with team management
- **RBAC**: Role-Based Access Control (Owner, Admin, Member, Super Admin)
- **Subscription Billing**: Polar.sh integration with Free, Pro, and Enterprise plans
- **Usage Metering**: Track AI messages, API calls, storage, and enforce quotas
- **Rate Limiting**: Upstash Redis-based rate limiting per user and organization
- **Audit Logging**: Immutable audit trails for SOC 2, GDPR, HIPAA compliance
- **Admin Panel**: Comprehensive super admin dashboard for system management
- **AI Chat**: OpenAI-powered chat functionality with usage tracking
- **Team Collaboration**: Invite members, manage roles, team permissions
- **Email Notifications**: Resend integration for transactional emails
- **Real-time Updates**: Convex real-time subscriptions across all features
- **Monitoring**: Sentry integration for error tracking and performance
- **Testing**: Comprehensive test suite with Vitest, Playwright, and k6

### Tech Stack

#### Frontend
- **React Router v7**: Full-stack React framework with SSR
- **TypeScript**: Type safety throughout the application
- **TailwindCSS v4**: Modern utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Framer Motion**: Smooth animations and transitions
- **Lucide React & Tabler Icons**: Icon libraries
- **Recharts**: Data visualization for analytics
- **React Markdown**: Markdown rendering for content

#### Backend & Infrastructure
- **Convex**: Real-time serverless database and backend functions
- **Clerk**: Authentication and user management
- **Polar.sh**: Subscription billing and payment management
- **Upstash Redis**: Rate limiting and caching
- **OpenAI**: AI chat capabilities via Vercel AI SDK
- **Resend**: Transactional email service
- **Sentry**: Error tracking and performance monitoring

#### Development & Deployment
- **Vite**: Fast build tool with HMR
- **Vitest**: Unit and integration testing
- **Playwright**: E2E cross-browser testing
- **k6**: Load and performance testing
- **Vercel**: Production deployment platform
- **GitHub Actions**: CI/CD pipelines

---

## Codebase Structure

```
taskcoda/
├── app/                              # Frontend Application (React Router v7)
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                      # shadcn/ui components (25+ components)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   └── [20+ more components]
│   │   ├── dashboard/               # Dashboard-specific components
│   │   │   ├── organization-switcher.tsx
│   │   │   ├── create-organization-dialog.tsx
│   │   │   ├── team-management.tsx
│   │   │   └── onboarding-flow.tsx
│   │   ├── legal/                   # Legal page components
│   │   │   ├── privacy-policy.tsx
│   │   │   ├── terms-of-service.tsx
│   │   │   └── cookie-policy.tsx
│   │   └── admin/                   # Admin panel components
│   ├── routes/                      # Application routes
│   │   ├── home.tsx                # Landing page
│   │   ├── pricing.tsx             # Pricing page
│   │   ├── contact.tsx             # Contact form
│   │   ├── sign-in.tsx             # Sign in page
│   │   ├── sign-up.tsx             # Sign up page
│   │   ├── success.tsx             # Payment success
│   │   ├── subscription-required.tsx
│   │   ├── dashboard/              # Protected dashboard routes
│   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   ├── index.tsx           # Dashboard home
│   │   │   ├── chat.tsx            # AI chat interface
│   │   │   ├── team.tsx            # Team management
│   │   │   ├── usage.tsx           # Usage analytics
│   │   │   ├── billing.tsx         # Billing management
│   │   │   └── settings.tsx        # User settings
│   │   ├── admin/                  # Super admin routes
│   │   │   ├── layout.tsx          # Admin layout
│   │   │   ├── index.tsx           # Admin dashboard
│   │   │   ├── users.tsx           # User management
│   │   │   ├── organizations.tsx   # Organization management
│   │   │   ├── health.tsx          # System health
│   │   │   ├── features.tsx        # Feature flags
│   │   │   ├── analytics.tsx       # Analytics dashboard
│   │   │   └── monitoring.tsx      # Monitoring dashboard
│   │   └── [legal routes]          # Privacy, Terms, AUP, Cookies
│   ├── lib/                        # Utilities and helpers
│   │   ├── logger.ts               # Structured logging with Pino
│   │   ├── utils.ts                # Common utilities
│   │   └── sentry.client.ts        # Sentry error tracking
│   ├── root.tsx                    # App entry point
│   └── routes.ts                   # Route configuration
├── convex/                          # Backend (Convex Serverless)
│   ├── schema.ts                   # Database schema (11 tables)
│   ├── auth.config.ts              # Clerk authentication config
│   ├── users.ts                    # User management functions
│   ├── organizations.ts            # Organization & team CRUD + RBAC
│   ├── billing.ts                  # Subscription management (Polar.sh)
│   ├── subscriptions.ts            # Webhook handlers for payments
│   ├── usageMetrics.ts             # Usage tracking & quota enforcement
│   ├── rateLimit.ts                # Rate limiting logic (Upstash Redis)
│   ├── auditLogs.ts                # Audit logging for compliance
│   ├── chatMessages.ts             # Chat message persistence
│   ├── contact.ts                  # Contact form submissions
│   ├── emails.ts                   # Email sending (Resend)
│   ├── admin.ts                    # Admin panel backend (22 functions)
│   ├── health.ts                   # Health check endpoints
│   ├── http.ts                     # HTTP endpoints & webhooks
│   └── lib/                        # Convex utilities
│       └── sentry.ts               # Server-side Sentry
├── tests/                           # Test Suite
│   ├── unit/                       # Unit tests (Vitest)
│   │   └── logger.test.ts
│   ├── e2e/                        # E2E tests (Playwright)
│   │   ├── homepage.spec.ts
│   │   └── admin-panel.spec.ts
│   ├── load/                       # Load tests (k6)
│   │   └── api-endpoints.js
│   ├── fixtures/                   # Test fixtures and mocks
│   │   ├── users.ts
│   │   ├── organizations.ts
│   │   └── subscriptions.ts
│   └── setup.ts                    # Test environment setup
├── .github/                         # GitHub Configuration
│   └── workflows/
│       └── test.yml                # CI/CD pipeline
├── docs/                            # Documentation
│   └── TESTING.md                  # Testing guide
├── public/                          # Static assets
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies and scripts
├── vitest.config.ts                # Vitest configuration
├── playwright.config.ts            # Playwright configuration
├── tailwind.config.ts              # TailwindCSS configuration
├── tsconfig.json                   # TypeScript configuration
└── react-router.config.ts          # React Router configuration
```

---

## Database Schema

### Tables Overview

| Table | Description | Key Indexes |
|-------|-------------|-------------|
| `users` | User accounts with Clerk integration | by_token, by_organization, by_email, by_role |
| `organizations` | Multi-tenant organizations | by_slug, by_owner |
| `teamMembers` | Organization team members with roles | by_organization, by_user, by_organization_and_user |
| `subscriptions` | Polar.sh subscription data | userId, polarId, organizationId |
| `webhookEvents` | Polar.sh webhook event log | type, polarEventId |
| `auditLogs` | Immutable audit trail | by_user, by_organization, by_action, by_timestamp, by_resource |
| `usageMetrics` | Usage tracking for billing | by_organization, by_metric_type, by_period, by_organization_and_period |
| `chatMessages` | AI chat message history | by_organization, by_user, by_conversation, by_timestamp |
| `contactSubmissions` | Contact form submissions | by_email, by_status, by_submitted_at |
| `featureFlags` | Feature flag management | by_name, by_organization, by_enabled |
| `systemMetrics` | Aggregated analytics data | by_type, by_date, by_type_and_date |

### Detailed Schema

#### users
```typescript
{
  name?: string
  email?: string
  image?: string
  tokenIdentifier: string              // Clerk user ID
  role?: "super_admin" | "admin" | "user"
  organizationId?: Id<"organizations">
  isSuspended?: boolean
  lastLoginAt?: number
  createdAt?: number
  updatedAt?: number
  deletedAt?: number                   // Soft delete for compliance
}
```

#### organizations
```typescript
{
  name: string
  slug: string                         // Unique org identifier
  ownerId: string                      // User tokenIdentifier
  plan?: string                        // "free", "pro", "enterprise"
  subscriptionId?: Id<"subscriptions">
  settings?: any                       // Org-specific settings
  metadata?: any                       // Additional data
  createdAt: number
  updatedAt: number
  deletedAt?: number
}
```

#### teamMembers
```typescript
{
  organizationId: Id<"organizations">
  userId: string                       // User tokenIdentifier
  role: "owner" | "admin" | "member"
  invitedBy?: string
  invitedAt?: number
  joinedAt?: number
  status: "pending" | "active" | "suspended"
  createdAt: number
  updatedAt: number
}
```

#### subscriptions
```typescript
{
  userId?: string
  organizationId?: Id<"organizations">
  polarId?: string                     // Polar.sh subscription ID
  polarPriceId?: string
  currency?: string
  interval?: string                    // "month" | "year"
  status?: string                      // "active", "canceled", "past_due"
  currentPeriodStart?: number
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
  amount?: number
  startedAt?: number
  endsAt?: number
  endedAt?: number
  canceledAt?: number
  customerCancellationReason?: string
  customerCancellationComment?: string
  metadata?: any
  customFieldData?: any
  customerId?: string
}
```

#### auditLogs
```typescript
{
  userId: string                       // Who performed the action
  organizationId?: Id<"organizations">
  action: string                       // e.g., "USER_CREATED", "SUBSCRIPTION_UPDATED"
  resource: string                     // e.g., "user/123", "subscription/456"
  resourceId?: string
  status: "success" | "failure"
  metadata?: any                       // Additional context
  ipAddress?: string
  userAgent?: string
  timestamp: number
}
```

#### usageMetrics
```typescript
{
  organizationId: Id<"organizations">
  userId: string
  metricType: string                   // "ai_messages", "api_calls", "storage_mb"
  quantity: number
  metadata?: any
  periodStart: number                  // Billing period start
  periodEnd: number                    // Billing period end
  timestamp: number
}
```

---

## Environment Variables

### Required for Development

```bash
# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=http://localhost:5173

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Frontend URL (for email links, redirects)
FRONTEND_URL=http://localhost:5173

# Polar.sh Payments
POLAR_ACCESS_TOKEN=polar_xxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
POLAR_SERVER=sandbox  # or "production"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx

# OpenAI (AI Chat)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Resend (Email Notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=hello@techsci.io

# Sentry (Error Tracking & Performance Monitoring)
VITE_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxx
VITE_GIT_COMMIT_SHA=auto  # Auto-populated on Vercel

# Logging
LOG_LEVEL=debug  # "debug", "info", "warn", "error"
NODE_ENV=development  # "development", "production"
```

### Required for Production

All of the above variables, with these changes:
- `CONVEX_DEPLOYMENT`: Use production deployment
- `FRONTEND_URL`: Your production domain (e.g., https://taskcoda.com)
- `POLAR_SERVER`: Set to `"production"`
- `LOG_LEVEL`: Set to `"info"` or `"warn"`
- `NODE_ENV`: Set to `"production"`

---

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables (edit .env.local with your keys)
```

### Development
```bash
# Start Convex development server (Terminal 1)
npx convex dev

# Start React development server (Terminal 2)
npm run dev
# App available at http://localhost:5173
```

### Building
```bash
# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server locally
npm run start
```

### Testing
```bash
# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit --coverage

# Run tests in watch mode
npm run test:watch

# Open Vitest UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Run load tests
npm run test:load

# Run all tests
npm run test:all
```

### Database Management
```bash
# Open Convex dashboard
npx convex dashboard

# Push schema changes
npx convex deploy

# Clear all data (development only!)
npx convex run clearAllData
```

---

## Common Development Tasks

### Adding a New Route

1. **Create route file** in `app/routes/`:
```typescript
// app/routes/my-new-page.tsx
import { type Route } from "./+types/my-new-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My New Page | Taskcoda" },
    { name: "description", content: "Page description" }
  ];
}

export default function MyNewPage() {
  return <div>My New Page Content</div>;
}
```

2. **Access route** at `/my-new-page`

### Adding a Protected Route

```typescript
// app/routes/dashboard/my-protected-page.tsx
import { useUser } from "@clerk/react-router";
import { redirect } from "react-router";
import { type Route } from "./+types/my-protected-page";

export async function loader({ request }: Route.LoaderArgs) {
  // Authentication is handled by Clerk
  // Add additional checks here if needed
  return {};
}

export default function MyProtectedPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return redirect("/sign-in");

  return <div>Protected Content for {user.firstName}</div>;
}
```

### Creating a Convex Query

```typescript
// convex/myQueries.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getMyData = query({
  args: {
    id: v.id("tableName")
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Query database
    const data = await ctx.db.get(args.id);
    return data;
  }
});
```

### Creating a Convex Mutation

```typescript
// convex/myMutations.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.string()
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Create item
    const itemId = await ctx.db.insert("items", {
      name: args.name,
      description: args.description,
      userId: identity.tokenIdentifier,
      createdAt: Date.now()
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId: identity.tokenIdentifier,
      action: "ITEM_CREATED",
      resource: `item/${itemId}`,
      resourceId: itemId,
      status: "success",
      timestamp: Date.now()
    });

    return itemId;
  }
});
```

### Adding a shadcn/ui Component

```bash
# List available components
npx shadcn@latest add

# Add specific component
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table

# Component will be added to app/components/ui/
```

### Implementing RBAC Check

```typescript
// Check if user has required role
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

function MyComponent({ organizationId }) {
  const permission = useQuery(api.organizations.checkPermission, {
    organizationId,
    requiredRole: "admin" // "owner", "admin", or "member"
  });

  if (!permission?.hasPermission) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

### Recording Usage Metrics

```typescript
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

function MyFeature() {
  const recordUsage = useMutation(api.usageMetrics.recordUsage);

  const handleAction = async () => {
    // Perform action
    // ...

    // Record usage
    await recordUsage({
      organizationId: currentOrgId,
      metricType: "ai_messages", // or "api_calls", "storage_mb", etc.
      quantity: 1,
      metadata: { feature: "my_feature" }
    });
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

---

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository** to Vercel
2. **Configure Environment Variables** in Vercel dashboard (all vars from .env.example)
3. **Deploy**:
   - Automatic on push to `main` branch
   - Preview deployments for PRs

4. **Convex Production Setup**:
```bash
# Deploy Convex to production
npx convex deploy --prod

# Get production URL and add to Vercel environment variables
```

5. **Polar.sh Webhook Setup**:
   - URL: `https://yourdomain.com/webhook/polar`
   - Secret: Add `POLAR_WEBHOOK_SECRET` to Vercel env vars

### Manual Build

```bash
# Build
npm run build

# Output in build/ directory:
# - build/client/ (static assets)
# - build/server/ (server code)

# Run production server
npm run start
```

---

## Important Notes

### Security Considerations
- All Convex mutations check `ctx.auth.getUserIdentity()` for authentication
- RBAC enforced in `organizations.ts` through `checkPermission` query
- Rate limiting applied per user and organization via Upstash Redis
- Audit logs are immutable (no delete/update operations)
- Sensitive data encrypted at rest by Convex
- Environment variables never committed to git
- Clerk handles all password security and session management

### Compliance Features
- **SOC 2**: Audit logging, access controls, encryption at rest
- **GDPR**: Data export, right to deletion (soft delete), consent tracking
- **HIPAA**: Encryption, audit trails, access controls

### Performance Optimization
- React Router SSR for fast initial page load
- Convex real-time subscriptions for instant updates
- Rate limiting prevents abuse
- Sentry monitors performance metrics
- CDN-served static assets via Vercel

### Billing & Quotas

**Free Plan**:
- 100 AI messages/month
- 1,000 API calls/month
- 100 MB storage
- 3 team members max

**Pro Plan** ($29/month):
- 10,000 AI messages/month
- 100,000 API calls/month
- 10 GB storage
- 25 team members max

**Enterprise Plan** (Custom):
- Unlimited usage
- Unlimited team members
- Custom features
- Dedicated support

### Monitoring & Logging
- **Sentry**: Error tracking and performance monitoring
- **Pino Logger**: Structured JSON logging with levels (debug, info, warn, error)
- **Audit Logs**: All critical actions logged to database
- **System Metrics**: Daily aggregated metrics for analytics

---

## Support & Resources

### Documentation
- React Router v7: https://reactrouter.com/
- Convex: https://docs.convex.dev/
- Clerk: https://clerk.com/docs
- Polar.sh: https://docs.polar.sh/
- shadcn/ui: https://ui.shadcn.com/

### Contact
- Email: hello@techsci.io
- Company: TechSci, Inc.

---

**Built with ❤️ by TechSci, Inc.**
