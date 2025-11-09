import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Activity, MessageSquare, Zap, Users, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface UsageDashboardProps {
  organizationId: Id<"organizations">;
}

export function UsageDashboard({ organizationId }: UsageDashboardProps) {
  // Get current usage for all metric types
  const aiMessagesQuota = useQuery(api.usageMetrics.checkQuota, {
    organizationId,
    metricType: "ai_messages",
  });

  const apiCallsQuota = useQuery(api.usageMetrics.checkQuota, {
    organizationId,
    metricType: "api_calls",
  });

  const storageQuota = useQuery(api.usageMetrics.checkQuota, {
    organizationId,
    metricType: "storage_mb",
  });

  const organization = useQuery(api.organizations.getOrganization, {
    organizationId,
  });

  const isLoading = !aiMessagesQuota || !apiCallsQuota || !storageQuota || !organization;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-2 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const quotas = [
    {
      title: "AI Messages",
      description: "This month",
      icon: MessageSquare,
      quota: aiMessagesQuota,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "API Calls",
      description: "This month",
      icon: Zap,
      quota: apiCallsQuota,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Storage",
      description: "Total used",
      icon: Activity,
      quota: storageQuota,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Plan Badge */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Usage & Quotas</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your resource consumption
          </p>
        </div>
        <Badge variant={organization.plan === "enterprise" ? "default" : "secondary"} className="capitalize">
          {organization.plan || "free"} Plan
        </Badge>
      </div>

      {/* Quota Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quotas.map((item) => {
          const Icon = item.icon;
          const percentage = item.quota.percentage || 0;
          const isNearLimit = percentage >= 80;
          const isOverLimit = !item.quota.hasQuota;

          return (
            <Card key={item.title} className={cn(isOverLimit && "border-destructive")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {item.description}
                  </CardDescription>
                </div>
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <Icon className={cn("h-4 w-4", item.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">
                      {item.quota.used.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      / {item.quota.limit === Infinity ? "∞" : item.quota.limit.toLocaleString()}
                    </div>
                  </div>

                  {item.quota.limit !== Infinity && (
                    <>
                      <Progress
                        value={percentage}
                        className={cn(
                          "h-2",
                          isOverLimit && "[&>div]:bg-destructive",
                          isNearLimit && !isOverLimit && "[&>div]:bg-yellow-500"
                        )}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          "text-muted-foreground",
                          isNearLimit && "text-yellow-600",
                          isOverLimit && "text-destructive"
                        )}>
                          {percentage.toFixed(0)}% used
                        </span>
                        <span className="text-muted-foreground">
                          {item.quota.remaining.toLocaleString()} remaining
                        </span>
                      </div>
                    </>
                  )}

                  {/* Warning messages */}
                  {isOverLimit && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>Quota exceeded - Upgrade to continue</span>
                    </div>
                  )}
                  {isNearLimit && !isOverLimit && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-600 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>Approaching limit - Consider upgrading</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {(organization.plan === "free" || organization.plan === "pro") && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {organization.plan === "free" ? "Upgrade to Pro" : "Upgrade to Enterprise"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {organization.plan === "free"
                    ? "Get 100x more AI messages and support for larger teams"
                    : "Get unlimited usage and priority support"}
                </p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Upgrade Now
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
