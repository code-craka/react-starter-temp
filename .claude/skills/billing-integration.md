# Billing Integration (Polar.sh)

> **Skill**: Polar.sh payment and subscription integration
> **Focus**: Checkout creation, webhook handling, subscription management, customer portal
> **Last Updated**: 2025-11-09

---

## Polar.sh Setup

### Environment Variables

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_xxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
POLAR_SERVER=sandbox  # or "production"
```

### Initialize Polar Client

```typescript
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});
```

---

## Checkout Flow

### Create Checkout Session (convex/billing.ts:60)

```typescript
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
    const organization = await ctx.runQuery(
      internal.billing.getOrganizationForCheckout,
      {
        organizationId: args.organizationId,
        userId: identity.subject,
      }
    );

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
      const hasPrice = product.prices.some((price: any) => price.id === args.priceId);
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
      successUrl: `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
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
```

### Authorization Check (convex/billing.ts:127)

```typescript
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
```

---

## Subscription Management

### Get Organization Subscription (convex/billing.ts:16)

```typescript
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
        q.eq("organizationId", args.organizationId)
         .eq("userId", identity.subject)
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
```

### Cancel Subscription (convex/billing.ts:177)

```typescript
export const cancelOrganizationSubscription = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Only organization owners can cancel subscriptions
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
```

---

## Customer Portal

### Get Customer Portal URL (convex/billing.ts:222)

```typescript
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
```

---

## Webhook Handling

### Webhook Endpoint (convex/http.ts)

```typescript
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/webhook/polar",
  method: "POST",
  handler: async (ctx, request) => {
    const signature = request.headers.get("webhook-signature");
    const payload = await request.json();

    // Verify webhook signature
    // ... signature verification logic ...

    // Process different event types
    switch (payload.type) {
      case "subscription.created":
        await ctx.runMutation(internal.subscriptions.handleSubscriptionCreated, {
          data: payload.data,
        });
        break;

      case "subscription.updated":
        await ctx.runMutation(internal.subscriptions.handleSubscriptionUpdated, {
          data: payload.data,
        });
        break;

      case "subscription.canceled":
        await ctx.runMutation(internal.subscriptions.handleSubscriptionCanceled, {
          data: payload.data,
        });
        break;

      // ... handle other events ...
    }

    return new Response("OK", { status: 200 });
  },
});

export default http;
```

### Link Subscription to Organization (convex/billing.ts:152)

```typescript
export const linkSubscriptionToOrganization = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    organizationId: v.id("organizations"),
    plan: v.string(),
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
```

### Update Organization Plan (convex/billing.ts:300)

```typescript
export const updateOrganizationPlan = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    plan: v.string(),
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
```

---

## Available Plans

### Get Available Plans (convex/billing.ts:267)

```typescript
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
    const plans = result.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      isRecurring: item.isRecurring,
      prices: item.prices.map((price: any) => ({
        id: price.id,
        amount: price.priceAmount,
        currency: price.priceCurrency,
        interval: price.recurringInterval,
      })),
    }));

    return { plans };
  },
});
```

---

## Plan Quotas

From `convex/usageMetrics.ts:390`:

```typescript
export function getQuotaForPlan(plan: string): Record<string, number> {
  const quotas = {
    free: {
      ai_messages: 100,
      api_calls: 1000,
      storage_mb: 100,
      team_members: 3,
    },
    pro: {
      ai_messages: 10000,
      api_calls: 100000,
      storage_mb: 10000,
      team_members: 25,
    },
    enterprise: {
      ai_messages: Infinity,
      api_calls: Infinity,
      storage_mb: Infinity,
      team_members: Infinity,
    },
  };

  return quotas[plan as keyof typeof quotas] || quotas.free;
}
```

---

## Frontend Usage

### Create Checkout

```typescript
import { useAction } from "convex/react";
import { api } from "~/convex/_generated/api";

function UpgradeButton({ organizationId, priceId, plan }) {
  const createCheckout = useAction(api.billing.createOrganizationCheckout);

  const handleUpgrade = async () => {
    const { checkoutUrl } = await createCheckout({
      organizationId,
      priceId,
      plan,
    });

    // Redirect to Polar checkout
    window.location.href = checkoutUrl;
  };

  return <button onClick={handleUpgrade}>Upgrade to {plan}</button>;
}
```

### Access Customer Portal

```typescript
import { useAction } from "convex/react";
import { api } from "~/convex/_generated/api";

function ManageSubscriptionButton({ organizationId }) {
  const getPortalUrl = useAction(api.billing.getCustomerPortalUrl);

  const handleManage = async () => {
    const { url } = await getPortalUrl({ organizationId });

    // Open customer portal in new tab
    window.open(url, "_blank");
  };

  return <button onClick={handleManage}>Manage Subscription</button>;
}
```

---

## Webhook Setup

### Configure Polar Webhook

1. Go to Polar.sh dashboard
2. Navigate to Webhooks
3. Add endpoint: `https://yourdomain.com/webhook/polar`
4. Select events:
   - subscription.created
   - subscription.updated
   - subscription.canceled
   - subscription.revoked
   - subscription.payment_failed
5. Copy webhook secret to `POLAR_WEBHOOK_SECRET` env var

---

## Testing

### Sandbox Mode

```bash
# Use sandbox for testing
POLAR_SERVER=sandbox
POLAR_ACCESS_TOKEN=polar_sandbox_xxxxxxxxxxxxx
```

### Test Cards

Polar.sh provides test cards for sandbox mode - check their documentation.

---

## Best Practices

1. **Only owners can manage billing**: Restrict checkout/cancel to owners
2. **Use internal mutations for webhooks**: Webhooks should call internal mutations
3. **Validate webhook signatures**: Always verify signature before processing
4. **Handle all webhook events**: subscription.created, updated, canceled, payment_failed
5. **Update organization plan**: Keep organization.plan in sync with subscription status
6. **Record audit logs**: Log all billing-related actions
7. **Error handling**: Gracefully handle Polar API failures
8. **Success URLs**: Include query params in success URL for client-side feedback

---

**Polar.sh handles all payment processing, PCI compliance, and customer management.**
