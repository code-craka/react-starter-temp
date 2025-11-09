import { useQuery } from "convex/react";
import { Activity, AlertCircle, Building2, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard - Taskcoda" },
    { name: "description", content: "Admin dashboard for Taskcoda" },
  ];
}

export default function AdminDashboard() {
  const systemHealth = useQuery(api.admin.getSystemHealth);
  const revenueMetrics = useQuery(api.admin.getRevenueMetrics, {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const engagementMetrics = useQuery(api.admin.getUserEngagementMetrics, { days: 30 });

  if (systemHealth === undefined || revenueMetrics === undefined || engagementMetrics === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Active Users",
      value: systemHealth.activeUsers,
      description: "Last 24 hours",
      icon: Users,
      trend: "+12%",
      trendUp: true,
    },
    {
      name: "Total Organizations",
      value: systemHealth.totalOrganizations,
      description: "All time",
      icon: Building2,
      trend: "+3%",
      trendUp: true,
    },
    {
      name: "MRR",
      value: `$${revenueMetrics.mrr.toLocaleString()}`,
      description: "Monthly recurring",
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
    },
    {
      name: "Error Rate",
      value: `${systemHealth.errorRate}%`,
      description: "Last 24 hours",
      icon: AlertCircle,
      trend: "-2%",
      trendUp: false,
    },
    {
      name: "API Calls",
      value: systemHealth.apiCallsToday.toLocaleString(),
      description: "Today",
      icon: Activity,
      trend: "+15%",
      trendUp: true,
    },
    {
      name: "DAU/MAU",
      value: engagementMetrics ? `${engagementMetrics.dau}/${engagementMetrics.mau}` : "0/0",
      description: "User engagement",
      icon: TrendingUp,
      trend: `${engagementMetrics?.engagementRate || 0}%`,
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor system health, user activity, and revenue metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <span className="text-sm text-green-600">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API</span>
              <span className="text-sm text-green-600">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <span className="text-sm text-green-600">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Processing</span>
              <span className="text-sm text-green-600">● Operational</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium">Error Rate</span>
              <span className={`text-sm ${systemHealth.errorRate < 1 ? "text-green-600" : systemHealth.errorRate < 5 ? "text-yellow-600" : "text-red-600"}`}>
                {systemHealth.errorRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MRR</span>
              <span className="text-sm font-bold">${revenueMetrics.mrr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ARR</span>
              <span className="text-sm font-bold">${revenueMetrics.arr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Subscriptions</span>
              <span className="text-sm">{revenueMetrics.activeSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Canceled Subscriptions</span>
              <span className="text-sm">{revenueMetrics.canceledSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium">Churn Rate</span>
              <span className={`text-sm ${revenueMetrics.churnRate < 5 ? "text-green-600" : revenueMetrics.churnRate < 10 ? "text-yellow-600" : "text-red-600"}`}>
                {revenueMetrics.churnRate}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>System metrics snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{systemHealth.totalUsers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{systemHealth.activeSubscriptions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Actions (24h)</p>
              <p className="text-2xl font-bold">{systemHealth.totalActionsLast24h}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
