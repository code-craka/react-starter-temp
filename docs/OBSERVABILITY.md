# Taskcoda Observability Guide

## TechSci, Inc. - Production Monitoring Setup

This guide covers the production observability setup for Taskcoda, including error tracking, logging, uptime monitoring, and alerting.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Sentry Error Tracking](#sentry-error-tracking)
3. [Structured Logging](#structured-logging)
4. [Health Check Endpoint](#health-check-endpoint)
5. [Uptime Monitoring](#uptime-monitoring)
6. [Performance Monitoring](#performance-monitoring)
7. [Alerting Configuration](#alerting-configuration)
8. [Admin Monitoring Dashboard](#admin-monitoring-dashboard)

---

## Environment Variables

Add these environment variables to your production deployment (Vercel, Netlify, etc.):

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
VITE_GIT_COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA  # Auto-populated on Vercel

# Logging Level (optional)
LOG_LEVEL=info  # Options: error, warn, info, debug

# Environment
NODE_ENV=production
```

### Obtaining Sentry DSN

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for "React"
3. Copy the DSN from Project Settings → Client Keys (DSN)
4. Add to your environment variables

---

## Sentry Error Tracking

### Features Implemented

✅ **Frontend Error Tracking** (app/lib/sentry.client.ts)
- Automatic error capture in React components
- Performance monitoring with page load metrics
- Session replay for debugging
- Custom user context (email, organization, plan)
- Filtered error reporting (excludes browser extensions, etc.)

✅ **Backend Error Tracking** (convex/lib/sentry.ts)
- Wrapper functions for Convex actions
- Error context with user and organization data
- Breadcrumb tracking for user actions

### Usage Examples

**Frontend:**
```typescript
import { captureSentryError, setSentryUser } from "~/lib/sentry.client";

// Set user context after login
setSentryUser({
  id: user.id,
  email: user.email,
  organizationId: org.id,
  plan: org.plan
});

// Manually capture errors
try {
  // risky operation
} catch (error) {
  captureSentryError(error, {
    context: "payment-processing"
  });
}
```

**Backend (Convex):**
```typescript
import { withSentry } from "./lib/sentry";

export const myMutation = mutation({
  handler: withSentry(async (ctx, args) => {
    // Your code here
  }, "myMutation")
});
```

### Configuration

**Sample Rates:**
- **Production**: 10% trace sampling, 10% replay sampling
- **Development**: 100% sampling (disabled by default)
- **Error Replay**: 100% on errors

**Filtered Errors:**
- Browser extension errors
- ResizeObserver loop warnings
- Development environment errors

---

## Structured Logging

### Implementation (app/lib/logger.ts)

Uses **Pino** for high-performance, structured JSON logging.

### Log Levels

- **ERROR**: Critical errors requiring immediate attention
- **WARN**: Warning conditions (quota breaches, rate limits)
- **INFO**: General informational messages
- **DEBUG**: Detailed debugging information

### Usage Examples

```typescript
import { logger, logAuth, logSubscription, logError } from "~/lib/logger";

// Authentication logs
logAuth.success(userId, email, { loginMethod: "oauth" });
logAuth.failure(email, "invalid_credentials");

// Subscription logs
logSubscription.created(subId, "pro", 29.99, { source: "stripe" });
logSubscription.paymentFailed(subId, 29.99, "card_declined");

// Error logs
logError.api("/api/users", "POST", 500, new Error("DB timeout"));

// General logging
logger.info({ userId, action: "profile_updated" }, "User profile updated");
```

### Log Format

```json
{
  "level": "INFO",
  "time": "2025-01-09T10:30:00.000Z",
  "service": "taskcoda",
  "company": "TechSci, Inc.",
  "env": "production",
  "event": "subscription_created",
  "subscriptionId": "sub_abc123",
  "plan": "pro",
  "amount": 29.99,
  "msg": "Subscription created"
}
```

### Log Aggregation

For production, send logs to:
- **LogDNA** (IBM Cloud) - 90-day retention
- **DataDog** - Full-stack observability
- **CloudWatch** (if on AWS)

---

## Health Check Endpoint

**Endpoint**: `GET /health`
**File**: `convex/health.ts`

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T10:30:00.000Z",
  "responseTime": "45ms",
  "checks": {
    "database": {
      "status": "healthy",
      "type": "convex"
    },
    "rateLimit": {
      "status": "healthy",
      "type": "upstash-redis"
    },
    "authentication": {
      "status": "healthy",
      "type": "clerk"
    },
    "payments": {
      "status": "healthy",
      "type": "polar.sh"
    }
  },
  "service": "taskcoda",
  "company": "TechSci, Inc.",
  "environment": "production"
}
```

### HTTP Status Codes

- **200 OK**: All systems healthy
- **503 Service Unavailable**: One or more systems unhealthy

---

## Uptime Monitoring

### Recommended Service: UptimeRobot

**Free Tier**: 50 monitors at 5-minute intervals

### Setup Instructions

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up
2. Create monitors for:
   - **Health Check**: `https://taskcoda.com/health` (every 5 min)
   - **Homepage**: `https://taskcoda.com` (every 5 min)
   - **Dashboard**: `https://taskcoda.com/dashboard` (every 5 min)
   - **Pricing**: `https://taskcoda.com/pricing` (every 5 min)

3. Configure alerts:
   - Email: `hello@techsci.io`
   - Slack webhook (optional)
   - SMS (paid tier)

### Alert Thresholds

- **Downtime**: Alert after 1 failed check (5 minutes)
- **Response Time**: Alert if > 5 seconds
- **SSL Certificate**: Alert 7 days before expiry

---

## Performance Monitoring

### Core Web Vitals Targets

Monitored via Sentry Performance:

| Metric | Target | Status |
|--------|--------|--------|
| **TTFB** (Time to First Byte) | < 200ms | ✅ |
| **FCP** (First Contentful Paint) | < 1.8s | ✅ |
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ |
| **TTI** (Time to Interactive) | < 3.5s | ✅ |
| **FID** (First Input Delay) | < 100ms | ✅ |

### Sentry Performance Configuration

```typescript
// In app/lib/sentry.client.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  integrations: [
    Sentry.browserTracingIntegration({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation,
    }),
  ],
});
```

### Custom Performance Tracking

```typescript
import { startSentryTransaction } from "~/lib/sentry.client";

const transaction = startSentryTransaction("checkout-flow", "user-interaction");
// ... perform checkout
transaction?.finish();
```

---

## Alerting Configuration

### Alert Channels

| Channel | Contact | Priority | Response Time |
|---------|---------|----------|---------------|
| **Email** | hello@techsci.io | All alerts | 15 min |
| **Slack** | #alerts-taskcoda | Critical only | 5 min |
| **PagerDuty** | Enterprise tier | Critical only | Immediate |

### Alert Thresholds

#### Error Rate Alerts

```yaml
Critical:
  - Error rate > 1% (last 5 min)
  - Failed payments
  - Database connection failure

Warning:
  - Error rate > 0.5% (last 15 min)
  - Response time > 5s
  - Quota usage > 90%
```

#### Uptime Alerts

```yaml
Critical:
  - Downtime > 1 minute
  - Health check fails 2 consecutive times

Warning:
  - Response time > 3s (3 consecutive checks)
```

#### Business Alerts

```yaml
Critical:
  - Payment failure rate > 5%
  - Subscription cancellation spike (> 10% daily)

Info:
  - New subscription created
  - Organization reaches quota limit
```

### Sentry Alert Rules

Configure in Sentry → Alerts → Create Alert Rule:

1. **High Error Rate**:
   - When: Number of errors > 100 in 1 hour
   - Then: Email hello@techsci.io

2. **Critical Error**:
   - When: Error level = "fatal"
   - Then: Email + Slack notification

3. **Performance Degradation**:
   - When: p95 response time > 5s for 10 minutes
   - Then: Email team

4. **New Issue**:
   - When: First seen error
   - Then: Create Sentry issue

---

## Admin Monitoring Dashboard

### Access

**URL**: `https://taskcoda.com/admin/monitoring`
**Required Role**: `super_admin`
**File**: `app/routes/admin/monitoring.tsx`

### Features

✅ **Real-Time Health Status**
- Live health check results
- Service status indicators
- Response time monitoring

✅ **Error Metrics**
- Error rate (24h)
- Recent failed actions
- Error distribution by type

✅ **External Tool Links**
- Sentry Dashboard
- Uptime Monitor
- Performance Metrics

✅ **Configuration Guide**
- Environment variables
- Setup instructions
- Contact information

### Auto-Refresh

Dashboard refreshes every 30 seconds automatically.

---

## Monitoring Checklist

### Initial Setup

- [ ] Create Sentry account and project
- [ ] Add `SENTRY_DSN` to environment variables
- [ ] Set up UptimeRobot monitors
- [ ] Configure email alerts to hello@techsci.io
- [ ] Test health check endpoint
- [ ] Verify Sentry is receiving errors

### Daily Monitoring

- [ ] Check error rate in Sentry
- [ ] Review uptime status
- [ ] Monitor performance metrics
- [ ] Check for quota breaches

### Weekly Review

- [ ] Review error trends
- [ ] Analyze slow transactions
- [ ] Check alert effectiveness
- [ ] Update thresholds if needed

### Monthly Review

- [ ] Review SLA compliance
- [ ] Analyze performance trends
- [ ] Optimize logging costs
- [ ] Update monitoring documentation

---

## Support & Contact

**Company**: TechSci, Inc.
**Product**: Taskcoda
**Email**: hello@techsci.io
**Phone**: +1 302 415 3171
**Address**: 1111B S Governors Ave STE 34002, Dover, DE 19904 US

### Emergency Contacts

For production incidents:
1. Check status.taskcoda.com (to be set up)
2. Email: hello@techsci.io
3. On-call: Configure PagerDuty escalation

---

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Pino Logging](https://getpino.io)
- [UptimeRobot Docs](https://uptimerobot.com/help/)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained by**: TechSci, Inc. Engineering Team
