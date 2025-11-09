# Deployment Guide

> **Skill**: Deployment procedures for Taskcoda
> **Focus**: Vercel deployment, environment setup, CI/CD, monitoring
> **Last Updated**: 2025-11-09

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Vercel)                   │
│   - React Router v7 SSR                         │
│   - Static assets on CDN                        │
│   - Edge functions                              │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┴───────────┬──────────────────┐
      ▼                       ▼                  ▼
┌──────────┐          ┌──────────┐      ┌──────────┐
│  Convex  │          │  Clerk   │      │ Polar.sh │
│ Database │          │   Auth   │      │ Payments │
└──────────┘          └──────────┘      └──────────┘
      │                       │                  │
      ▼                       ▼                  ▼
┌──────────┐          ┌──────────┐      ┌──────────┐
│ Upstash  │          │  Resend  │      │  Sentry  │
│  Redis   │          │  Emails  │      │Monitoring│
└──────────┘          └──────────┘      └──────────┘
```

---

## Prerequisites

### Required Accounts

1. **Vercel** - Frontend hosting
2. **Convex** - Backend database
3. **Clerk** - Authentication
4. **Polar.sh** - Payments (sandbox + production)
5. **Upstash** - Redis for rate limiting
6. **OpenAI** - AI chat features
7. **Resend** - Transactional emails
8. **Sentry** - Error tracking (optional but recommended)

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/taskcoda.git
cd taskcoda

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables (see below)
# Edit .env.local with your credentials

# Start Convex
npx convex dev

# Start frontend (in new terminal)
npm run dev
```

---

## Environment Variables

### Development (.env.local)

```bash
# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=http://localhost:5173

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Polar.sh Payments (Sandbox)
POLAR_ACCESS_TOKEN=polar_sandbox_xxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
POLAR_SERVER=sandbox

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=hello@techsci.io

# Sentry (Optional)
VITE_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxx
VITE_GIT_COMMIT_SHA=local

# Logging
LOG_LEVEL=debug
NODE_ENV=development
```

### Production (Vercel Environment Variables)

Same as development, but:
- `CONVEX_DEPLOYMENT`: Use production deployment
- `FRONTEND_URL`: `https://taskcoda.com` (your domain)
- `POLAR_SERVER`: `production`
- `POLAR_ACCESS_TOKEN`: Production token (not sandbox)
- `LOG_LEVEL`: `info` or `warn`
- `NODE_ENV`: `production`
- `VITE_GIT_COMMIT_SHA`: Auto-populated by Vercel

---

## Vercel Deployment

### Initial Setup

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**:
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects React Router v7

3. **Configure Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from .env.example
   - Use production values

4. **Deploy**:
   - Click "Deploy"
   - Vercel builds and deploys automatically

### Automatic Deployments

- **Production**: Push to `main` branch → Deploy to production
- **Preview**: Open PR → Deploy preview environment
- **Development**: Push to other branches → Deploy preview

### Vercel Configuration

File: `react-router.config.ts`

```typescript
import { type Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router";

export default {
  ...vercelPreset(),
  ssr: true,
} satisfies Config;
```

---

## Convex Deployment

### Development

```bash
# Start development server
npx convex dev

# This creates a dev deployment and watches for changes
```

### Production

```bash
# Deploy schema and functions to production
npx convex deploy --prod

# Get production URL
# Add to Vercel env vars as VITE_CONVEX_URL
```

### Convex Dashboard

```bash
# Open dashboard
npx convex dashboard

# View:
# - Database tables and data
# - Function logs
# - Scheduled functions
# - File storage
```

---

## CI/CD Pipeline

### GitHub Actions

File: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}

      - name: Check coverage thresholds
        run: |
          if [ -f coverage/coverage-summary.json ]; then
            statements=$(jq '.total.statements.pct' coverage/coverage-summary.json)
            if (( $(echo "$statements < 60" | bc -l) )); then
              echo "Coverage $statements% is below 60% threshold"
              exit 1
            fi
            echo "Coverage $statements% meets 60% threshold"
          fi

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build-check:
    name: Build Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Build
        run: npm run build
```

### Deployment Workflow

1. **Develop locally** → Test with `npm run test:all`
2. **Push to feature branch** → CI runs tests
3. **Open PR** → Vercel deploys preview + CI checks
4. **Review & approve** → Merge to main
5. **Auto-deploy to production** → Vercel + Convex prod

---

## Polar.sh Webhook Setup

### Development (Local Testing)

Use ngrok or similar to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local dev server
ngrok http 5173

# Use ngrok URL in Polar webhook:
# https://abc123.ngrok.io/webhook/polar
```

### Production

1. Go to Polar.sh dashboard
2. Navigate to Webhooks
3. Add endpoint: `https://taskcoda.com/webhook/polar`
4. Select events:
   - subscription.created
   - subscription.updated
   - subscription.canceled
   - subscription.revoked
   - subscription.payment_failed
5. Copy webhook secret
6. Add to Vercel env vars as `POLAR_WEBHOOK_SECRET`

---

## Monitoring & Logging

### Sentry Setup

1. Create Sentry project
2. Get DSN from project settings
3. Add to environment variables:
   - `VITE_SENTRY_DSN`: Client-side DSN
   - `SENTRY_AUTH_TOKEN`: For source maps

### Vercel Analytics

Automatically enabled with:
```typescript
import { Analytics } from "@vercel/analytics/react";

<Analytics />
```

### Convex Logs

View in Convex dashboard:
- Function execution logs
- Error traces
- Performance metrics

### Structured Logging

Uses Pino logger (`app/lib/logger.ts`):
```typescript
import { logger } from "~/lib/logger";

logger.info({ event: "deployment", version: "1.0.0" }, "Deployment successful");
logger.error({ event: "error", error: err.message }, "Operation failed");
```

---

## Health Checks

### Convex Health Endpoint

File: `convex/health.ts`

```typescript
import { httpAction } from "./_generated/server";

export const health = httpAction(async () => {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: Date.now(),
      version: process.env.VERSION || "unknown",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
```

Access: `https://your-deployment.convex.site/health`

### Admin Health Dashboard

Route: `/admin/health`

Monitors:
- Active users (last 24h)
- Total users
- Active subscriptions
- Error rate
- API calls
- System metrics

---

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Convex Rollback

```bash
# List deployments
npx convex deployments list

# Rollback to previous deployment
npx convex deployments rollback <deployment-id>
```

---

## Performance Optimization

### Vercel Edge Functions

React Router v7 automatically uses Vercel Edge Functions for SSR.

### CDN & Caching

- Static assets cached on Vercel CDN
- Set cache headers for images, fonts
- Use `stale-while-revalidate` for dynamic content

### Database Optimization

- Use indexes for all queries
- Limit result sets with `.take()`
- Batch operations with `Promise.all()`

---

## Common Deployment Issues

### Issue: "Function not found"

**Solution**: Deploy Convex functions first
```bash
npx convex deploy --prod
```

### Issue: "Environment variable not set"

**Solution**: Check Vercel environment variables match .env.example

### Issue: "Webhook signature verification failed"

**Solution**: Ensure `POLAR_WEBHOOK_SECRET` matches Polar dashboard

### Issue: "Rate limit errors"

**Solution**: Check Upstash Redis credentials and connection

---

## Deployment Checklist

### Pre-Deploy
- [ ] All tests passing (`npm run test:all`)
- [ ] Type check passing (`npm run typecheck`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Convex deployed (`npx convex deploy --prod`)
- [ ] Polar webhook configured

### Deploy
- [ ] Push to main branch
- [ ] Vercel auto-deploys
- [ ] Check deployment logs
- [ ] Verify deployment URL

### Post-Deploy
- [ ] Test production site
- [ ] Check Sentry for errors
- [ ] Verify webhooks working
- [ ] Monitor system health dashboard
- [ ] Check analytics

---

## Support & Troubleshooting

### Logs

- **Vercel Logs**: Vercel dashboard → Functions → Logs
- **Convex Logs**: Convex dashboard → Logs
- **Sentry**: sentry.io → Issues
- **Structured Logs**: Search Pino JSON logs

### Common Commands

```bash
# Check Vercel deployment
vercel

# View Vercel logs
vercel logs

# Deploy Convex
npx convex deploy --prod

# Open Convex dashboard
npx convex dashboard

# Run tests locally
npm run test:all

# Build locally
npm run build

# Type check
npm run typecheck
```

---

**Taskcoda uses a modern deployment stack optimized for performance, reliability, and developer experience.**

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

