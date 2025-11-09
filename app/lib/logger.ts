import pino from "pino";

// Define strict type for log context
interface LogContext {
  [key: string]: string | number | boolean | string[] | Record<string, unknown>;
}

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    service: "taskcoda",
    company: "TechSci, Inc.",
  },
  // Pretty print in development
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "HH:MM:ss Z",
        },
      }
    : undefined,
});

// Helper functions for common log patterns
export const logAuth = {
  success: (userId: string, email: string, context?: LogContext) => {
    logger.info(
      {
        event: "auth_success",
        userId,
        email,
        ...context,
      },
      "User authenticated successfully"
    );
  },
  failure: (email: string, reason: string, context?: LogContext) => {
    logger.warn(
      {
        event: "auth_failure",
        email,
        reason,
        ...context,
      },
      "Authentication failed"
    );
  },
  logout: (userId: string, context?: LogContext) => {
    logger.info(
      {
        event: "auth_logout",
        userId,
        ...context,
      },
      "User logged out"
    );
  },
};

export const logOrganization = {
  created: (
    orgId: string,
    orgName: string,
    userId: string,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "organization_created",
        orgId,
        orgName,
        userId,
        ...context,
      },
      "Organization created"
    );
  },
  deleted: (
    orgId: string,
    orgName: string,
    userId: string,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "organization_deleted",
        orgId,
        orgName,
        userId,
        ...context,
      },
      "Organization deleted"
    );
  },
  memberAdded: (
    orgId: string,
    memberId: string,
    role: string,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "organization_member_added",
        orgId,
        memberId,
        role,
        ...context,
      },
      "Member added to organization"
    );
  },
};

export const logSubscription = {
  created: (
    subscriptionId: string,
    plan: string,
    amount: number,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "subscription_created",
        subscriptionId,
        plan,
        amount,
        ...context,
      },
      "Subscription created"
    );
  },
  updated: (
    subscriptionId: string,
    oldPlan: string,
    newPlan: string,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "subscription_updated",
        subscriptionId,
        oldPlan,
        newPlan,
        ...context,
      },
      "Subscription updated"
    );
  },
  canceled: (
    subscriptionId: string,
    plan: string,
    context?: LogContext
  ) => {
    logger.info(
      {
        event: "subscription_canceled",
        subscriptionId,
        plan,
        ...context,
      },
      "Subscription canceled"
    );
  },
  paymentFailed: (
    subscriptionId: string,
    amount: number,
    reason: string,
    context?: LogContext
  ) => {
    logger.error(
      {
        event: "subscription_payment_failed",
        subscriptionId,
        amount,
        reason,
        ...context,
      },
      "Subscription payment failed"
    );
  },
};

export const logQuota = {
  breached: (
    orgId: string,
    metricType: string,
    usage: number,
    limit: number,
    context?: LogContext
  ) => {
    logger.warn(
      {
        event: "quota_breached",
        orgId,
        metricType,
        usage,
        limit,
        percentUsed: Math.round((usage / limit) * 100),
        ...context,
      },
      "Quota breached"
    );
  },
  warning: (
    orgId: string,
    metricType: string,
    usage: number,
    limit: number,
    context?: LogContext
  ) => {
    logger.warn(
      {
        event: "quota_warning",
        orgId,
        metricType,
        usage,
        limit,
        percentUsed: Math.round((usage / limit) * 100),
        ...context,
      },
      "Quota warning - approaching limit"
    );
  },
};

export const logRateLimit = {
  hit: (
    identifier: string,
    endpoint: string,
    limit: number,
    context?: LogContext
  ) => {
    logger.warn(
      {
        event: "rate_limit_hit",
        identifier,
        endpoint,
        limit,
        ...context,
      },
      "Rate limit exceeded"
    );
  },
};

export const logError = {
  api: (
    endpoint: string,
    method: string,
    statusCode: number,
    error: Error,
    context?: LogContext
  ) => {
    logger.error(
      {
        event: "api_error",
        endpoint,
        method,
        statusCode,
        error: error.message,
        stack: error.stack,
        ...context,
      },
      "API error occurred"
    );
  },
  database: (
    operation: string,
    table: string,
    error: Error,
    context?: LogContext
  ) => {
    logger.error(
      {
        event: "database_error",
        operation,
        table,
        error: error.message,
        stack: error.stack,
        ...context,
      },
      "Database error occurred"
    );
  },
  external: (
    service: string,
    operation: string,
    error: Error,
    context?: LogContext
  ) => {
    logger.error(
      {
        event: "external_service_error",
        service,
        operation,
        error: error.message,
        stack: error.stack,
        ...context,
      },
      "External service error"
    );
  },
};

// Export default logger for general use
export default logger;
