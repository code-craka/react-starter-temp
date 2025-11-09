// Sentry integration for Convex server-side actions
// This file provides utilities to capture errors in Convex mutations and actions

interface SentryEvent {
  message: string;
  level: "error" | "warning" | "info";
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Capture an error to Sentry (server-side)
 * In production, you would send this to Sentry's ingest API
 * For now, we'll log it and prepare the payload
 */
export async function captureSentryError(
  error: Error,
  context?: {
    userId?: string;
    organizationId?: string;
    action?: string;
    extra?: Record<string, any>;
  }
) {
  const dsn = process.env.SENTRY_DSN;

  // Always log to console
  console.error("[Sentry Error]", {
    error: error.message,
    stack: error.stack,
    context,
  });

  if (!dsn || process.env.NODE_ENV === "development") {
    return;
  }

  // Prepare Sentry event
  const event: SentryEvent = {
    message: error.message,
    level: "error",
    tags: {
      service: "taskcoda-backend",
      action: context?.action || "unknown",
    },
    extra: {
      stack: error.stack,
      ...context?.extra,
    },
  };

  if (context?.userId) {
    event.user = {
      id: context.userId,
    };
  }

  if (context?.organizationId) {
    event.tags!.organization_id = context.organizationId;
  }

  // In production, send to Sentry via their HTTP API
  // For now, this is a placeholder for the actual implementation
  // You would use fetch to POST to Sentry's ingest endpoint
  try {
    // Example: await fetch(sentryIngestUrl, { method: 'POST', body: JSON.stringify(event) });
    console.log("[Sentry] Event prepared:", event);
  } catch (sentryError) {
    console.error("Failed to send error to Sentry:", sentryError);
  }
}

/**
 * Wrapper for Convex mutations with Sentry error tracking
 */
export function withSentry<TArgs, TReturn>(
  handler: (ctx: any, args: TArgs) => Promise<TReturn>,
  actionName: string
) {
  return async (ctx: any, args: TArgs): Promise<TReturn> => {
    try {
      return await handler(ctx, args);
    } catch (error) {
      // Get user context if available
      const identity = await ctx.auth.getUserIdentity?.();
      const userId = identity?.subject;

      // Capture error to Sentry
      if (error instanceof Error) {
        await captureSentryError(error, {
          userId,
          action: actionName,
          extra: { args },
        });
      }

      // Re-throw error to maintain normal error flow
      throw error;
    }
  };
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  // In production, this would be sent to Sentry
  console.log("[Sentry Breadcrumb]", {
    message,
    category,
    data,
    timestamp: new Date().toISOString(),
  });
}
