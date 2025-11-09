import { useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Server,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/monitoring";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Monitoring - Admin" },
    { name: "description", content: "System monitoring dashboard" },
  ];
}

interface HealthCheck {
  status: string;
  timestamp: string;
  responseTime: string;
  checks: {
    database: { status: string; type: string };
    rateLimit: { status: string; type: string };
    authentication: { status: string; type: string };
    payments: { status: string; type: string };
  };
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const systemHealth = useQuery(api.admin.getSystemHealth);
  const recentErrors = useQuery(api.admin.getRecentErrors, { limit: 10 });

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/health");
      const data = await response.json();
      setHealthStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Health check failed:", error);
      setHealthStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "healthy" || status === "operational") {
      return (
        <Badge variant="outline" className="border-green-600 text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Healthy
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Unhealthy
      </Badge>
    );
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            System Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time system health, errors, and performance metrics
          </p>
        </div>
        <Button onClick={checkHealth} disabled={isLoading}>
          {isLoading ? "Checking..." : "Refresh Health"}
        </Button>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Last checked:{" "}
                {lastChecked ? lastChecked.toLocaleTimeString() : "Never"}
              </CardDescription>
            </div>
            {healthStatus && getStatusBadge(healthStatus.status)}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : healthStatus ? (
            <div className="space-y-4">
              {/* Response Time */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Response Time</span>
                </div>
                <span className="text-sm font-bold">
                  {healthStatus.responseTime}
                </span>
              </div>

              {/* Service Checks */}
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(healthStatus.checks).map(([service, check]) => (
                  <div
                    key={service}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {service.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {check.type}
                      </p>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to fetch health status
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Metrics */}
      {systemHealth && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Error Rate (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{systemHealth.errorRate}%</div>
              <p
                className={`text-xs mt-1 ${
                  systemHealth.errorRate < 1
                    ? "text-green-600"
                    : systemHealth.errorRate < 5
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {systemHealth.failedActionsLast24h} failed actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Actions (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemHealth.totalActionsLast24h}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                User and system actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {systemHealth.apiCallsToday.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total API requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Errors
          </CardTitle>
          <CardDescription>Last 10 failed actions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentErrors === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
              <p className="text-lg font-medium">No Recent Errors</p>
              <p className="text-sm text-muted-foreground">
                System is running smoothly
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentErrors.map((error) => (
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(new Date(error.timestamp).toISOString())}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Monitoring Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            External Monitoring
          </CardTitle>
          <CardDescription>
            Links to external monitoring and error tracking services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Sentry Error Tracking</p>
              <p className="text-xs text-muted-foreground">
                Real-time error monitoring and alerting
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Uptime Monitoring</p>
              <p className="text-xs text-muted-foreground">
                Service availability and uptime tracking
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://uptimerobot.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configure
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Performance Metrics</p>
              <p className="text-xs text-muted-foreground">
                Page load times and Core Web Vitals
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Environment variables required for monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="p-2 bg-muted rounded">
              <code>SENTRY_DSN=https://your-sentry-dsn@sentry.io/project</code>
            </div>
            <div className="p-2 bg-muted rounded">
              <code>VITE_GIT_COMMIT_SHA=$VERCEL_GIT_COMMIT_SHA</code>
            </div>
            <div className="p-2 bg-muted rounded">
              <code>NODE_ENV=production</code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Contact: <a href="mailto:hello@techsci.io" className="underline">hello@techsci.io</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
