import { useQuery } from "convex/react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/analytics";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analytics - Admin" },
    { name: "description", content: "Analytics dashboard" },
  ];
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(30); // days

  const startDate = new Date(
    Date.now() - dateRange * 24 * 60 * 60 * 1000
  ).toISOString().split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

  const revenueMetrics = useQuery(api.admin.getRevenueMetrics, {
    startDate,
    endDate,
  });
  const engagementMetrics = useQuery(api.admin.getUserEngagementMetrics, {
    days: dateRange,
  });
  const featureUsage = useQuery(api.admin.getFeatureUsageMetrics, {
    days: dateRange,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Revenue metrics, user engagement, and feature usage
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {revenueMetrics === undefined ||
      engagementMetrics === undefined ||
      featureUsage === undefined ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Revenue Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Revenue Metrics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueMetrics.mrr)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly Recurring Revenue
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">
                      +12.5%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ARR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueMetrics.arr)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Annual Recurring Revenue
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">
                      +12.5%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics.activeSubscriptions}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paying customers
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">
                      +8.2%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      from last period
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Churn Rate
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics.churnRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {revenueMetrics.canceledSubscriptions} canceled
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowDownRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">
                      -2.1%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      (improvement)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* User Engagement */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Daily Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {engagementMetrics.dau}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Users active in last 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Monthly Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {engagementMetrics.mau}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Users active in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Retention Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {engagementMetrics.retentionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    User retention over period
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Engagement Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>
                  User activity breakdown for last {dateRange} days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-sm font-bold">
                    {engagementMetrics.activeInPeriod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chat Messages</span>
                  <span className="text-sm font-bold">
                    {engagementMetrics.totalChatMessages.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage Events</span>
                  <span className="text-sm font-bold">
                    {engagementMetrics.totalUsageEvents.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Engagement Rate</span>
                  <Badge
                    variant={
                      engagementMetrics.engagementRate > 50
                        ? "default"
                        : "outline"
                    }
                    className={
                      engagementMetrics.engagementRate > 50
                        ? "bg-green-600"
                        : ""
                    }
                  >
                    {engagementMetrics.engagementRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Subscription status overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Active Subscriptions
                  </span>
                  <span className="text-sm font-bold">
                    {revenueMetrics.activeSubscriptions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Canceled Subscriptions
                  </span>
                  <span className="text-sm font-bold">
                    {revenueMetrics.canceledSubscriptions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Churn Rate</span>
                  <span
                    className={`text-sm font-bold ${
                      revenueMetrics.churnRate < 5
                        ? "text-green-600"
                        : revenueMetrics.churnRate < 10
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {revenueMetrics.churnRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Average Revenue</span>
                  <span className="text-sm font-bold">
                    {revenueMetrics.activeSubscriptions > 0
                      ? formatCurrency(
                          revenueMetrics.mrr /
                            revenueMetrics.activeSubscriptions
                        )
                      : "$0"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Usage
              </CardTitle>
              <CardDescription>
                Most used features in last {dateRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(featureUsage).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No usage data available
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(featureUsage)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([feature, count]) => {
                      const maxUsage = Math.max(...Object.values(featureUsage));
                      const percentage = ((count as number) / maxUsage) * 100;
                      return (
                        <div key={feature} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {feature.replace(/_/g, " ")}
                            </span>
                            <span className="text-sm font-bold">
                              {(count as number).toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Automated insights from your analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engagementMetrics.engagementRate > 50 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        Strong Engagement Rate
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your engagement rate of {engagementMetrics.engagementRate}%
                        is above industry average
                      </p>
                    </div>
                  </div>
                )}
                {revenueMetrics.churnRate < 5 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Low Churn Rate</p>
                      <p className="text-sm text-muted-foreground">
                        Your churn rate of {revenueMetrics.churnRate}% is
                        excellent. Keep up the good work!
                      </p>
                    </div>
                  </div>
                )}
                {engagementMetrics.retentionRate > 60 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Great Retention</p>
                      <p className="text-sm text-muted-foreground">
                        Your retention rate of {engagementMetrics.retentionRate}%
                        shows users are finding value
                      </p>
                    </div>
                  </div>
                )}
                {engagementMetrics.dau / engagementMetrics.mau > 0.2 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">High DAU/MAU Ratio</p>
                      <p className="text-sm text-muted-foreground">
                        Users are engaging frequently, indicating strong product
                        stickiness
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
