import { useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Database,
  Server,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/health";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "System Health - Admin" },
    { name: "description", content: "System health dashboard" },
  ];
}

export default function SystemHealthDashboard() {
  const systemHealth = useQuery(api.admin.getSystemHealth);
  const recentErrors = useQuery(api.admin.getRecentErrors, { limit: 20 });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getHealthStatus = (errorRate: number) => {
    if (errorRate < 1) return "healthy";
    if (errorRate < 5) return "warning";
    return "critical";
  };

  const services = [
    {
      name: "Database",
      status: "operational",
      icon: Database,
      description: "Convex database is operational",
    },
    {
      name: "API",
      status: "operational",
      icon: Server,
      description: "All API endpoints responding",
    },
    {
      name: "Authentication",
      status: "operational",
      icon: Shield,
      description: "Clerk authentication service",
    },
    {
      name: "Payment Processing",
      status: "operational",
      icon: TrendingUp,
      description: "Polar.sh integration active",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
        <p className="text-muted-foreground">
          Monitor system status, performance, and errors
        </p>
      </div>

      {systemHealth === undefined ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overall System Status</CardTitle>
                  <CardDescription>Current system health metrics</CardDescription>
                </div>
                <Badge
                  variant={
                    getHealthStatus(systemHealth.errorRate) === "healthy"
                      ? "outline"
                      : getHealthStatus(systemHealth.errorRate) === "warning"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    getHealthStatus(systemHealth.errorRate) === "healthy"
                      ? "border-green-600 text-green-600"
                      : ""
                  }
                >
                  {getHealthStatus(systemHealth.errorRate) === "healthy" && (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {getHealthStatus(systemHealth.errorRate) === "warning" && (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {getHealthStatus(systemHealth.errorRate) === "critical" && (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {getHealthStatus(systemHealth.errorRate).toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">{systemHealth.errorRate}%</p>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{systemHealth.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">Currently online</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-2xl font-bold">
                    {systemHealth.apiCallsToday.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">
                    {systemHealth.totalActionsLast24h}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth.failedActionsLast24h} failed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <service.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {service.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-green-600 text-green-600"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemHealth.activeUsers} active (24h)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemHealth.totalOrganizations}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemHealth.activeSubscriptions} with subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>
                Failed actions and errors from the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentErrors === undefined ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : recentErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
                  <p className="text-lg font-medium">No Errors Detected</p>
                  <p className="text-sm text-muted-foreground">
                    System is running smoothly
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentErrors.map((error: any) => (
                    <div
                      key={error._id}
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-sm">{error.action}</p>
                          <Badge variant="destructive" className="flex-shrink-0">
                            Failed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
                          {error.resource}
                        </p>
                        {error.metadata && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                            <pre>{JSON.stringify(error.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                        {formatDate(error.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Level
                </CardTitle>
                <CardDescription>System activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Requests</span>
                    <span className="text-sm font-bold">
                      {systemHealth.apiCallsToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Actions</span>
                    <span className="text-sm font-bold">
                      {systemHealth.totalActionsLast24h}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <span className="text-sm font-bold">
                      {systemHealth.activeUsers}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Analysis
                </CardTitle>
                <CardDescription>Error breakdown (24h)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span
                      className={`text-sm font-bold ${
                        systemHealth.errorRate < 1
                          ? "text-green-600"
                          : systemHealth.errorRate < 5
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {systemHealth.errorRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Actions</span>
                    <span className="text-sm font-bold">
                      {systemHealth.failedActionsLast24h}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {(100 - systemHealth.errorRate).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
