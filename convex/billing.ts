/**
 * Billing Management using Polar.sh
 *
 * Handles organization-level billing, subscriptions, and payment management.
 */

import { v } from "convex/values";
import { action, mutation, query, internalMutation } from "./_generated/server";
import { Polar } from "@polar-sh/sdk";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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

/**
 * Get organization's subscription details
 */
export const getOrganizationSubscription = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of organization
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", identity.subject)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this organization");
    }

    // Get organization
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get subscription if exists
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .first();

    return {
      organization,
      subscription,
      hasActiveSubscription: subscription?.status === "active",
      plan: organization.plan || "free",
    };
  },
});

/**
 * Create checkout session for organization upgrade
 */
export const createOrganizationCheckout = action({
  args: {
    organizationId: v.id("organizations"),
    priceId: v.string(),
    plan: v.string(), // "free", "pro", "enterprise"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get organization and verify ownership/admin
    const organization = await ctx.runQuery(internal.billing.getOrganizationForCheckout, {
      organizationId: args.organizationId,
      userId: identity.subject,
    });

    if (!organization) {
      throw new Error("Organization not found or not authorized");
    }

    // Initialize Polar client
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
      const hasPrice = product.prices.some((price) => price.id === args.priceId);
      if (hasPrice) {
        productId = product.id;
        break;
      }
    }

    if (!productId) {
      throw new Error(`Product not found for price ID: ${args.priceId}`);
    }

    // Create checkout session
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${process.env.FRONTEND_URL}/dashboard/settings?tab=billing&success=true`,
      customerEmail: identity.email!,
      metadata: {
        organizationId: args.organizationId,
        userId: identity.subject,
        priceId: args.priceId,
        plan: args.plan,
      },
    });

    return { checkoutUrl: checkout.url };
  },
});

/**
 * Internal query to get organization for checkout (with auth check)
 */
export const getOrganizationForCheckout = query({
  args: {
    organizationId: v.id("organizations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is owner or admin
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return null;
    }

    return await ctx.db.get(args.organizationId);
  },
});

/**
 * Link subscription to organization when webhook arrives
 */
export const linkSubscriptionToOrganization = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    organizationId: v.id("organizations"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    // Update subscription with organization ID
    await ctx.db.patch(args.subscriptionId, {
      organizationId: args.organizationId,
    });

    // Update organization with subscription ID and plan
    await ctx.db.patch(args.organizationId, {
      subscriptionId: args.subscriptionId,
      plan: args.plan,
    });

    return { success: true };
  },
});

/**
 * Cancel organization subscription
 */
export const cancelOrganizationSubscription = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get organization and verify ownership
    const membership = await ctx.runQuery(api.organizations.getTeamMemberRole, {
      organizationId: args.organizationId,
    });

    if (membership?.role !== "owner") {
      throw new Error("Only organization owners can cancel subscriptions");
    }

    // Get subscription
    const subscription = await ctx.runQuery(api.billing.getOrganizationSubscription, {
      organizationId: args.organizationId,
    });

    if (!subscription.subscription || !subscription.subscription.polarId) {
      throw new Error("No active subscription found");
    }

    // Cancel via Polar API
    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    await polar.subscriptions.cancel({
      id: subscription.subscription.polarId,
    });

    return { success: true };
  },
});

/**
 * Get customer portal URL for managing subscription
 */
export const getCustomerPortalUrl = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of organization
    const membership = await ctx.runQuery(api.organizations.getTeamMemberRole, {
      organizationId: args.organizationId,
    });

    if (!membership) {
      throw new Error("Not authorized to view this organization");
    }

    // Get subscription
    const subscription = await ctx.runQuery(api.billing.getOrganizationSubscription, {
      organizationId: args.organizationId,
    });

    if (!subscription.subscription?.customerId) {
      throw new Error("No customer ID found");
    }

    // Create customer portal session
    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const result = await polar.customerSessions.create({
      customerId: subscription.subscription.customerId,
    });

    return { url: result.customerPortalUrl };
  },
});

/**
 * Get available Polar plans
 */
export const getAvailablePlans = action({
  handler: async () => {
    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    const { result } = await polar.products.list({
      organizationId: process.env.POLAR_ORGANIZATION_ID,
      isArchived: false,
    });

    // Transform the data to remove Date objects and keep only needed fields
    const plans = result.items.map((item) => {
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

    return { plans };
  },
});

/**
 * Update organization plan (called by webhook)
 */
export const updateOrganizationPlan = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    subscriptionStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organizationId, {
      plan: args.plan,
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      userId: "system",
      organizationId: args.organizationId,
      action: "SUBSCRIPTION_UPDATED",
      resource: `organization/${args.organizationId}`,
      status: "success",
      metadata: {
        plan: args.plan,
        subscriptionStatus: args.subscriptionStatus,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});
