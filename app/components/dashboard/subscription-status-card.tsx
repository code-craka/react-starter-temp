import { useQuery } from "convex/react";
import type { OrganizationId } from "~/types/organization";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Rocket, CreditCard, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router";

export function SubscriptionStatusCard() {
  const user = useQuery(api.users.findUserByToken, { tokenIdentifier: "" });

  if (!user?.organizationId) {
    return null;
  }

  return <SubscriptionStatus organizationId={user.organizationId} />;
}

function SubscriptionStatus({ organizationId }: { organizationId: OrganizationId }) {
  const subscriptionData = useQuery(api.billing.getOrganizationSubscription, {
    organizationId,
  });

  if (!subscriptionData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const { organization, subscription, hasActiveSubscription, plan } = subscriptionData;
  const isFree = plan === "free";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
            {plan.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>{organization.name}'s current plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasActiveSubscription && subscription && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                ${(subscription.amount || 0) / 100}/{subscription.interval}
              </span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Next billing</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {isFree && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Upgrade to Pro to unlock advanced features and higher quotas
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {isFree ? (
          <Button className="w-full" asChild>
            <Link to="/pricing">
              <Rocket className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard/billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
