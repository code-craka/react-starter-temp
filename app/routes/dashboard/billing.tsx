import { useQuery, useMutation, useAction } from "convex/react";
import type { OrganizationId } from "~/types/organization";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Rocket,
  Building2,
} from "lucide-react";
import { useState } from "react";

export default function BillingPage() {
  const user = useQuery(api.users.findUserByToken, { tokenIdentifier: "" });
  const [isLoading, setIsLoading] = useState(false);

  if (!user?.organizationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
            <CardDescription>
              You need to be part of an organization to manage billing.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <BillingManagement organizationId={user.organizationId} />;
}

function BillingManagement({ organizationId }: { organizationId: OrganizationId }) {
  const subscriptionData = useQuery(api.billing.getOrganizationSubscription, {
    organizationId,
  });
  const getPortalUrl = useAction(api.billing.getCustomerPortalUrl);
  const cancelSubscription = useAction(api.billing.cancelOrganizationSubscription);
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await getPortalUrl({ organizationId });
      window.location.href = result.url;
    } catch (error) {
      console.error("Error getting portal URL:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.")) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription({ organizationId });
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscriptionData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { organization, subscription, hasActiveSubscription, plan } = subscriptionData;
  const isFree = plan === "free";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's subscription and billing information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                {plan.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              {organization.name}'s subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                {hasActiveSubscription ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {subscription?.status || "No subscription"}
                    </span>
                  </div>
                )}
              </div>

              {subscription && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">
                      ${(subscription.amount || 0) / 100} {subscription.currency?.toUpperCase() || "USD"}
                    </span>
                  </div>

                  {subscription.interval && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Billing Period</span>
                      <span className="text-sm font-medium capitalize">
                        {subscription.interval}
                      </span>
                    </div>
                  )}

                  {subscription.currentPeriodEnd && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Next Billing Date</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {subscription.cancelAtPeriodEnd && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Subscription will cancel on{" "}
                          {new Date(subscription.currentPeriodEnd || 0).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            {hasActiveSubscription && subscription?.customerId && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
                {!subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </>
            )}
            {isFree && (
              <Button className="w-full" asChild>
                <a href="/pricing">
                  <Rocket className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Plan Features</CardTitle>
            </div>
            <CardDescription>
              Features included in your {plan} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanFeatures plan={plan} />
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Billing Information</CardTitle>
            </div>
            <CardDescription>
              View and manage your payment methods and billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {subscription.customerId ? (
                <p>
                  To view your billing history and manage payment methods, click "Manage
                  Subscription" above to access the customer portal.
                </p>
              ) : (
                <p>No billing information available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlanFeatures({ plan }: { plan: string }) {
  const features = {
    free: [
      { name: "100 AI messages per month", included: true },
      { name: "3 team members", included: true },
      { name: "Basic support", included: true },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false },
      { name: "Priority support", included: false },
    ],
    pro: [
      { name: "10,000 AI messages per month", included: true },
      { name: "25 team members", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom integrations", included: false },
    ],
    enterprise: [
      { name: "Unlimited AI messages", included: true },
      { name: "Unlimited team members", included: true },
      { name: "24/7 premium support", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "SLA guarantee", included: true },
    ],
  };

  const planFeatures = features[plan as keyof typeof features] || features.free;

  return (
    <ul className="space-y-3">
      {planFeatures.map((feature, index) => (
        <li key={index} className="flex items-start gap-2">
          {feature.included ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <span
            className={`text-sm ${
              feature.included ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {feature.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
