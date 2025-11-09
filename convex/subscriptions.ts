import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { api } from "./_generated/api";
import { action, httpAction, mutation, query } from "./_generated/server";

// Type guard to check if a price has amount and currency fields (fixed price)
function hasPriceAmount(
  price: unknown
): price is { id: string; priceAmount: number; priceCurrency: string; recurringInterval?: string | null } {
  return (
    typeof price === 'object' &&
    price !== null &&
    'priceAmount' in price &&
    'priceCurrency' in price &&
    'id' in price
  );
}

// Webhook event validator - matches Polar.sh webhook payload structure
const subscriptionDataSchema = v.object({
  id: v.string(),
  status: v.union(
    v.literal("incomplete"),
    v.literal("incomplete_expired"),
    v.literal("trialing"),
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("unpaid"),
    v.literal("revoked")
  ),
  customer_id: v.string(),
  product_id: v.string(),
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  price_id: v.optional(v.string()),
  recurring_interval: v.optional(v.string()),
  current_period_start: v.optional(v.string()),
  current_period_end: v.optional(v.string()),
  cancel_at_period_end: v.optional(v.boolean()),
  started_at: v.optional(v.string()),
  ended_at: v.optional(v.string()),
  canceled_at: v.optional(v.string()),
  customer_cancellation_reason: v.optional(v.string()),
  customer_cancellation_comment: v.optional(v.string()),
  discount_id: v.optional(v.string()),
  checkout_id: v.optional(v.string()),
  created_at: v.string(),
  modified_at: v.optional(v.string()),
  metadata: v.optional(v.any()),
  custom_field_data: v.optional(v.any()),
});

const webhookEventSchema = v.object({
  type: v.union(
    v.literal("subscription.created"),
    v.literal("subscription.updated"),
    v.literal("subscription.active"),
    v.literal("subscription.canceled"),
    v.literal("subscription.uncanceled"),
    v.literal("subscription.revoked"),
    v.literal("order.created")
  ),
  data: subscriptionDataSchema,
});

const createCheckout = async ({
  customerEmail,
  productPriceId,
  successUrl,
  metadata,
}: {
  customerEmail: string;
  productPriceId: string;
  successUrl: string;
  metadata?: Record<string, string>;
}) => {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  const polar = new Polar({
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  // Get product ID from price ID
  const { result: productsResult } = await polar.products.list({
    organizationId: process.env.POLAR_ORGANIZATION_ID,
    isArchived: false,
  });

  let productId = null;
  for (const product of productsResult.items) {
    const hasPrice = product.prices.some(
      (price) => price.id === productPriceId
    );
    if (hasPrice) {
      productId = product.id;
      break;
    }
  }

  if (!productId) {
    throw new Error(`Product not found for price ID: ${productPriceId}`);
  }

  const checkoutData = {
    products: [productId],
    successUrl: successUrl,
    customerEmail: customerEmail,
    metadata: {
      ...metadata,
      priceId: productPriceId,
    },
  };

  console.log(
    "Creating checkout with data:",
    JSON.stringify(checkoutData, null, 2)
  );

  const result = await polar.checkouts.create(checkoutData);
  return result;
};

export const getAvailablePlansQuery = query({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => {
      const fixedPrices = item.prices.filter(hasPriceAmount) as Array<{
        id: string;
        priceAmount: number;
        priceCurrency: string;
        recurringInterval?: string | null;
      }>;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        isRecurring: item.isRecurring,
        prices: fixedPrices.map((price) => ({
          id: price.id,
          amount: price.priceAmount,
          currency: price.priceCurrency,
          interval: price.recurringInterval ?? null,
        })),
      };
    });

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

export const getAvailablePlans = action({
  handler: async (ctx) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const cleanedItems = result.items.map((item) => {
      const fixedPrices = item.prices.filter(hasPriceAmount) as Array<{
        id: string;
        priceAmount: number;
        priceCurrency: string;
        recurringInterval?: string | null;
      }>;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        isRecurring: item.isRecurring,
        prices: fixedPrices.map((price) => ({
          id: price.id,
          amount: price.priceAmount,
          currency: price.priceCurrency,
          interval: price.recurringInterval ?? null,
        })),
      };
    });

    return {
      items: cleanedItems,
      pagination: result.pagination,
    };
  },
});

export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // First check if user exists
    let user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.subject,
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await ctx.runMutation(api.users.upsertUser);

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    const checkout = await createCheckout({
      customerEmail: user.email!,
      productPriceId: args.priceId,
      successUrl: `${process.env.FRONTEND_URL}/success`,
      metadata: {
        userId: user.tokenIdentifier,
      },
    });

    return checkout.url;
  },
});

export const checkUserSubscriptionStatus = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tokenIdentifier: string;

    if (args.userId) {
      // Use provided userId directly as tokenIdentifier (they are the same)
      tokenIdentifier = args.userId;
    } else {
      // Fall back to auth context
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return { hasActiveSubscription: false };
      }
      tokenIdentifier = identity.subject;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const checkUserSubscriptionStatusByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk user ID (this assumes the tokenIdentifier contains the Clerk user ID)
    // In Clerk, the subject is typically in the format "user_xxxxx" where xxxxx is the Clerk user ID
    const tokenIdentifier = `user_${args.clerkUserId}`;

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    // If not found with user_ prefix, try the raw userId
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.clerkUserId))
        .unique();
    }

    if (!user) {
      return { hasActiveSubscription: false };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasActiveSubscription = subscription?.status === "active";
    return { hasActiveSubscription };
  },
});

export const fetchUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    return subscription;
  },
});

export const handleWebhookEvent = mutation({
  args: {
    body: webhookEventSchema,
  },
  handler: async (ctx, args) => {
    // Extract event type from webhook payload
    const eventType = args.body.type;

    // Store webhook event
    await ctx.db.insert("webhookEvents", {
      type: eventType,
      polarEventId: args.body.data.id,
      createdAt: args.body.data.created_at,
      modifiedAt: args.body.data.modified_at || args.body.data.created_at,
      data: args.body.data,
    });

    switch (eventType) {
      case "subscription.created":
        // Insert new subscription with all required fields
        const subscriptionId = await ctx.db.insert("subscriptions", {
          // Required Polar IDs
          polarId: args.body.data.id,
          customerId: args.body.data.customer_id,
          productId: args.body.data.product_id,

          // Optional price ID
          polarPriceId: args.body.data.price_id,

          // Required pricing details
          currency: args.body.data.currency || "USD",
          amount: args.body.data.amount || 0,
          interval: args.body.data.recurring_interval as "month" | "year" | undefined,

          // User/org links
          userId: args.body.data.metadata?.userId,
          organizationId: args.body.data.metadata?.organizationId as any,

          // Required status (validated by schema)
          status: args.body.data.status,

          // Required timestamps
          createdAt: new Date(args.body.data.created_at).getTime(),
          modifiedAt: args.body.data.modified_at
            ? new Date(args.body.data.modified_at).getTime()
            : undefined,
          currentPeriodStart: args.body.data.current_period_start
            ? new Date(args.body.data.current_period_start).getTime()
            : Date.now(),
          currentPeriodEnd: args.body.data.current_period_end
            ? new Date(args.body.data.current_period_end).getTime()
            : undefined,

          // Required cancellation flag
          cancelAtPeriodEnd: args.body.data.cancel_at_period_end || false,

          // Optional timestamps
          startedAt: args.body.data.started_at
            ? new Date(args.body.data.started_at).getTime()
            : undefined,
          endedAt: args.body.data.ended_at
            ? new Date(args.body.data.ended_at).getTime()
            : undefined,
          canceledAt: args.body.data.canceled_at
            ? new Date(args.body.data.canceled_at).getTime()
            : undefined,

          // Cancellation details
          customerCancellationReason:
            args.body.data.customer_cancellation_reason as any,
          customerCancellationComment:
            args.body.data.customer_cancellation_comment || undefined,

          // Additional Polar fields
          discountId: args.body.data.discount_id,
          checkoutId: args.body.data.checkout_id,

          // Metadata
          metadata: args.body.data.metadata
            ? {
                userId: args.body.data.metadata.userId,
                organizationId: args.body.data.metadata.organizationId,
                plan: args.body.data.metadata.plan,
              }
            : undefined,
          customFieldData: args.body.data.custom_field_data,
        });

        // Link subscription to organization if organizationId exists
        if (args.body.data.metadata.organizationId) {
          const orgId = args.body.data.metadata.organizationId as any;
          const plan = args.body.data.metadata.plan || "pro";

          await ctx.db.patch(orgId, {
            subscriptionId: subscriptionId,
            plan: plan,
            updatedAt: Date.now(),
          });
        }
        break;

      case "subscription.updated":
        // Find existing subscription
        const existingSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (existingSub) {
          await ctx.db.patch(existingSub._id, {
            ...(args.body.data.amount !== undefined && { amount: args.body.data.amount }),
            status: args.body.data.status,
            ...(args.body.data.current_period_start && {
              currentPeriodStart: new Date(args.body.data.current_period_start).getTime(),
            }),
            ...(args.body.data.current_period_end && {
              currentPeriodEnd: new Date(args.body.data.current_period_end).getTime(),
            }),
            ...(args.body.data.cancel_at_period_end !== undefined && {
              cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
            }),
            ...(args.body.data.modified_at && {
              modifiedAt: new Date(args.body.data.modified_at).getTime(),
            }),
            metadata: args.body.data.metadata
              ? {
                  userId: args.body.data.metadata.userId,
                  organizationId: args.body.data.metadata.organizationId,
                  plan: args.body.data.metadata.plan,
                }
              : existingSub.metadata,
            customFieldData: args.body.data.custom_field_data || existingSub.customFieldData,
          });
        }
        break;

      case "subscription.active":
        // Find and update subscription
        const activeSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (activeSub) {
          await ctx.db.patch(activeSub._id, {
            status: args.body.data.status,
            ...(args.body.data.started_at && {
              startedAt: new Date(args.body.data.started_at).getTime(),
            }),
          });
        }
        break;

      case "subscription.canceled":
        // Find and update subscription
        const canceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (canceledSub) {
          await ctx.db.patch(canceledSub._id, {
            status: args.body.data.status,
            ...(args.body.data.canceled_at && {
              canceledAt: new Date(args.body.data.canceled_at).getTime(),
            }),
            ...(args.body.data.customer_cancellation_reason && {
              customerCancellationReason: args.body.data.customer_cancellation_reason as
                | "customer_service"
                | "too_expensive"
                | "missing_features"
                | "switched_service"
                | "unused"
                | "other",
            }),
            ...(args.body.data.customer_cancellation_comment && {
              customerCancellationComment: args.body.data.customer_cancellation_comment,
            }),
          });
        }
        break;

      case "subscription.uncanceled":
        // Find and update subscription
        const uncanceledSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (uncanceledSub) {
          await ctx.db.patch(uncanceledSub._id, {
            status: args.body.data.status,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            customerCancellationReason: undefined,
            customerCancellationComment: undefined,
          });
        }
        break;

      case "subscription.revoked":
        // Find and update subscription
        const revokedSub = await ctx.db
          .query("subscriptions")
          .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
          .first();

        if (revokedSub) {
          await ctx.db.patch(revokedSub._id, {
            status: "revoked",
            endedAt: args.body.data.ended_at
              ? new Date(args.body.data.ended_at).getTime()
              : undefined,
          });
        }
        break;

      case "order.created":
        // Orders are handled through the subscription events
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        break;
    }
  },
});

// Use our own validation similar to validateEvent from @polar-sh/sdk/webhooks
// The only diffference is we use btoa to encode the secret since Convex js runtime doesn't support Buffer
const validateEvent = (
  body: string | Buffer,
  headers: Record<string, string>,
  secret: string
) => {
  const base64Secret = btoa(secret);
  const webhook = new Webhook(base64Secret);
  webhook.verify(body, headers);
};

export const paymentWebhook = httpAction(async (ctx, request) => {
  try {
    const rawBody = await request.text();

    // Internally validateEvent uses headers as a dictionary e.g. headers["webhook-id"]
    // So we need to convert the headers to a dictionary
    // (request.headers is a Headers object which is accessed as request.headers.get("webhook-id"))
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Validate the webhook event
    if (!process.env.POLAR_WEBHOOK_SECRET) {
      throw new Error(
        "POLAR_WEBHOOK_SECRET environment variable is not configured"
      );
    }
    validateEvent(rawBody, headers, process.env.POLAR_WEBHOOK_SECRET);

    const body = JSON.parse(rawBody);

    // track events and based on events store data
    await ctx.runMutation(api.subscriptions.handleWebhookEvent, {
      body,
    });

    return new Response(JSON.stringify({ message: "Webhook received!" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return new Response(
        JSON.stringify({ message: "Webhook verification failed" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify({ message: "Webhook failed" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});

export const createCustomerPortalUrl = action({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    const polar = new Polar({
      server: "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    try {
      const result = await polar.customerSessions.create({
        customerId: args.customerId,
      });

      // Only return the URL to avoid Convex type issues
      return { url: result.customerPortalUrl };
    } catch (error) {
      console.error("Error creating customer session:", error);
      throw new Error("Failed to create customer session");
    }
  },
});
