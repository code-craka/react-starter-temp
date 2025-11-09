import * as Sentry from "@sentry/react";

// Initialize Sentry for client-side error tracking
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  // Only initialize if DSN is provided
  if (!dsn) {
    console.warn("SENTRY_DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Release tracking with git commit SHA
    release: process.env.VITE_GIT_COMMIT_SHA || "development",

    // Set sample rates
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration({
        // Set up routing instrumentation
        routingInstrumentation: Sentry.reactRouterV6Instrumentation,
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Filter out non-critical errors
    beforeSend(event, hint) {
      // Don't send events in development
      if (environment === "development") {
        return null;
      }

      // Filter out known third-party errors
      const error = hint.originalException;
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error.message);

        // Ignore browser extension errors
        if (message.includes("extension://") || message.includes("chrome-extension://")) {
          return null;
        }

        // Ignore ResizeObserver errors (benign)
        if (message.includes("ResizeObserver loop")) {
          return null;
        }
      }

      return event;
    },

    // Set default tags
    initialScope: {
      tags: {
        service: "taskcoda",
        company: "TechSci, Inc.",
      },
    },
  });
}

// Helper to set user context
export function setSentryUser(user: {
  id: string;
  email?: string;
  organizationId?: string;
  plan?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });

  // Set custom tags for better filtering
  if (user.organizationId) {
    Sentry.setTag("organization_id", user.organizationId);
  }
  if (user.plan) {
    Sentry.setTag("plan_type", user.plan);
  }
}

// Helper to clear user context on logout
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Helper to capture custom events
export function captureSentryEvent(
  message: string,
  level: Sentry.SeverityLevel,
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// Helper to capture errors with context
export function captureSentryError(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper to add breadcrumb
export function addSentryBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

// Helper to start a transaction
export function startSentryTransaction(
  name: string,
  op: string
): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

export default Sentry;
