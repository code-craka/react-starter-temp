import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { checkRateLimitSimple, getRateLimitForPlan } from "./rateLimit";
import { AUDIT_ACTIONS } from "./auditLogs";
import { METRIC_TYPES } from "./usageMetrics";
import { internal } from "./_generated/api";

export const chat = httpAction(async (ctx, req) => {
  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing auth token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = identity.tokenIdentifier;

    // Get user and organization
    const user = await ctx.runQuery(internal.users.findUserByTokenInternal, {
      tokenIdentifier: userId,
    });

    if (!user || !user.organizationId) {
      return new Response(
        JSON.stringify({
          error: "Organization required: Please create or join an organization",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get organization details
    const org = await ctx.runQuery(internal.organizations.getOrganizationInternal, {
      organizationId: user.organizationId,
    });

    if (!org) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check rate limit
    const rateLimitConfig = getRateLimitForPlan(org.plan, "chat");
    const rateLimit = await checkRateLimitSimple({
      key: `chat:${user.organizationId}`,
      limit: rateLimitConfig.limit,
      window: rateLimitConfig.window,
      prefix: "rl",
    });

    if (!rateLimit.success) {
      // Log rate limit exceeded
      await ctx.runMutation(internal.auditLogs.createAuditLogInternal, {
        userId,
        action: AUDIT_ACTIONS.AI_CHAT_MESSAGE,
        resource: "chat",
        status: "failure",
        organizationId: user.organizationId,
        metadata: { reason: "rate_limit_exceeded" },
      });

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: rateLimit.retryAfter,
          limit: rateLimit.limit,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfter || 60),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    // Check quota
    const quota = await ctx.runQuery(internal.usageMetrics.checkQuotaInternal, {
      organizationId: user.organizationId,
      metricType: METRIC_TYPES.AI_MESSAGES,
    });

    if (!quota.hasQuota) {
      // Log quota exceeded
      await ctx.runMutation(internal.auditLogs.createAuditLogInternal, {
        userId,
        action: AUDIT_ACTIONS.AI_CHAT_MESSAGE,
        resource: "chat",
        status: "failure",
        organizationId: user.organizationId,
        metadata: { reason: "quota_exceeded", quota },
      });

      return new Response(
        JSON.stringify({
          error: "Monthly quota exceeded",
          used: quota.used,
          limit: quota.limit,
          plan: org.plan,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract the `messages` from the body of the request
    const { messages, conversationId } = await req.json();

    // Log AI generation started
    await ctx.runMutation(internal.auditLogs.createAuditLogInternal, {
      userId,
      action: AUDIT_ACTIONS.AI_GENERATION_STARTED,
      resource: "chat",
      status: "success",
      organizationId: user.organizationId,
      metadata: { messageCount: messages.length, conversationId },
    });

    let generatedText = "";

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      async onFinish({ text, usage }) {
        generatedText = text;

        // Record usage metric
        await ctx.runMutation(internal.usageMetrics.recordUsageInternal, {
          organizationId: user.organizationId,
          userId,
          metricType: METRIC_TYPES.AI_MESSAGES,
          quantity: 1,
          metadata: {
            conversationId,
            tokensUsed: usage?.totalTokens || 0,
            model: "gpt-4o",
          },
        });

        // Save user message to chat history
        const userMessage = messages[messages.length - 1];
        if (userMessage) {
          await ctx.runMutation(internal.chatMessages.saveMessage, {
            organizationId: user.organizationId,
            userId,
            role: "user",
            content: userMessage.content,
            conversationId,
          });
        }

        // Save assistant response to chat history
        await ctx.runMutation(internal.chatMessages.saveMessage, {
          organizationId: user.organizationId,
          userId,
          role: "assistant",
          content: text,
          conversationId,
          metadata: { tokensUsed: usage?.totalTokens || 0 },
        });

        // Log completion
        await ctx.runMutation(internal.auditLogs.createAuditLogInternal, {
          userId,
          action: AUDIT_ACTIONS.AI_GENERATION_COMPLETED,
          resource: "chat",
          status: "success",
          organizationId: user.organizationId,
          metadata: {
            conversationId,
            tokensUsed: usage?.totalTokens || 0,
          },
        });
      },
    });

    // Respond with the stream
    return result.toDataStreamResponse({
      headers: {
        "Access-Control-Allow-Origin":
          process.env.FRONTEND_URL || "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        Vary: "origin",
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.reset),
        "X-Quota-Used": String(quota.used),
        "X-Quota-Limit": String(quota.limit),
        "X-Quota-Remaining": String(quota.remaining),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);

    // Log error
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.runQuery(internal.users.findUserByTokenInternal, {
          tokenIdentifier: identity.tokenIdentifier,
        });

        if (user?.organizationId) {
          await ctx.runMutation(internal.auditLogs.createAuditLogInternal, {
            userId: identity.tokenIdentifier,
            action: AUDIT_ACTIONS.AI_CHAT_MESSAGE,
            resource: "chat",
            status: "failure",
            organizationId: user.organizationId,
            metadata: { error: String(error) },
          });
        }
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/api/auth/webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

// Log that routes are configured
console.log("HTTP routes configured");

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
