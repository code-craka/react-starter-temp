import { useMutation, useQuery } from "convex/react";
import { Search, Eye, DollarSign, Gauge } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/organizations";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Organization Management - Admin" },
    { name: "description", content: "Manage organizations" },
  ];
}

export default function OrganizationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string | undefined>();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [newPlan, setNewPlan] = useState("");
  const [reason, setReason] = useState("");
  const [quotaType, setQuotaType] = useState("ai_messages");
  const [quotaLimit, setQuotaLimit] = useState("");

  const organizations = useQuery(api.admin.listOrganizations, {
    searchQuery,
    plan: planFilter,
    limit: 50,
    offset: 0,
  });

  const orgDetails = useQuery(
    api.admin.getOrganizationDetails,
    selectedOrgId ? { organizationId: selectedOrgId as any } : "skip"
  );

  const overrideSubscription = useMutation(api.admin.overrideSubscription);
  const adjustQuota = useMutation(api.admin.adjustQuota);

  const handleSubscriptionOverride = async () => {
    if (!selectedOrgId || !newPlan || !reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await overrideSubscription({
        organizationId: selectedOrgId as any,
        newPlan,
        reason,
      });
      toast.success("Subscription updated successfully");
      setShowSubscriptionDialog(false);
      setNewPlan("");
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update subscription");
    }
  };

  const handleQuotaAdjustment = async () => {
    if (!selectedOrgId || !quotaLimit || !reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await adjustQuota({
        organizationId: selectedOrgId as any,
        quotaType,
        newLimit: parseInt(quotaLimit),
        reason,
      });
      toast.success("Quota adjusted successfully");
      setShowQuotaDialog(false);
      setQuotaLimit("");
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust quota");
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const getPlanBadge = (plan?: string) => {
    if (plan === "enterprise") {
      return <Badge variant="destructive">Enterprise</Badge>;
    } else if (plan === "pro") {
      return <Badge>Pro</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Organization Management
        </h2>
        <p className="text-muted-foreground">
          View and manage organization accounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find organizations by name or slug</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={planFilter || ""}
              onChange={(e) => setPlanFilter(e.target.value || undefined)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Organizations {organizations && `(${organizations.total})`}
          </CardTitle>
          <CardDescription>
            {organizations?.hasMore &&
              `Showing first ${organizations.organizations.length} results`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : organizations.organizations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No organizations found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.organizations.map((org) => (
                  <TableRow key={org._id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {org.slug}
                    </TableCell>
                    <TableCell>{getPlanBadge(org.plan)}</TableCell>
                    <TableCell>{org.memberCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(org.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrgId(org._id);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Organization Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
            <DialogDescription>
              View organization information, members, usage, and billing
            </DialogDescription>
          </DialogHeader>
          {orgDetails === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : orgDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm mt-1">{orgDetails.organization.name}</p>
                </div>
                <div>
                  <Label>Slug</Label>
                  <p className="text-sm mt-1">{orgDetails.organization.slug}</p>
                </div>
                <div>
                  <Label>Plan</Label>
                  <div className="mt-1">
                    {getPlanBadge(orgDetails.organization.plan)}
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm mt-1">
                    {formatDate(orgDetails.organization.createdAt)}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSubscriptionDialog(true)}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Override Subscription
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowQuotaDialog(true)}
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  Adjust Quota
                </Button>
              </div>

              {/* Members */}
              <div>
                <Label className="text-base">Members ({orgDetails.members.length})</Label>
                <div className="mt-2 space-y-2">
                  {orgDetails.members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members</p>
                  ) : (
                    orgDetails.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {member.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          <Badge
                            variant={
                              member.status === "active"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Subscription */}
              {orgDetails.subscription && (
                <div>
                  <Label className="text-base">Subscription</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Status</span>
                        <span className="text-sm font-medium">
                          {orgDetails.subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Amount</span>
                        <span className="text-sm font-medium">
                          ${orgDetails.subscription.amount || 0}
                          {orgDetails.subscription.interval && (
                            <span className="text-muted-foreground">
                              /{orgDetails.subscription.interval}
                            </span>
                          )}
                        </span>
                      </div>
                      {orgDetails.subscription.currentPeriodEnd && (
                        <div className="flex justify-between">
                          <span className="text-sm">Period End</span>
                          <span className="text-sm font-medium">
                            {formatDate(orgDetails.subscription.currentPeriodEnd)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Usage Metrics */}
              {orgDetails.usageMetrics && orgDetails.usageMetrics.length > 0 && (
                <div>
                  <Label className="text-base">Usage Metrics (Current Month)</Label>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {orgDetails.usageMetrics.map((metric) => (
                      <div
                        key={metric._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm font-medium capitalize">
                          {metric.metricType.replace("_", " ")}
                        </span>
                        <span className="text-sm font-bold">{metric.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {orgDetails.auditLogs && orgDetails.auditLogs.length > 0 && (
                <div>
                  <Label className="text-base">Recent Activity</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {orgDetails.auditLogs.slice(0, 10).map((log) => (
                      <div
                        key={log._id}
                        className="flex items-start gap-3 p-3 border rounded-lg text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Organization not found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscription Override Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Subscription</DialogTitle>
            <DialogDescription>
              Manually change the organization's plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">New Plan</Label>
              <select
                id="plan"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select plan...</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <Label htmlFor="sub-reason">Reason</Label>
              <Textarea
                id="sub-reason"
                placeholder="E.g., Special pricing agreement, partnership..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSubscriptionDialog(false);
                setNewPlan("");
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscriptionOverride}
              disabled={!newPlan || !reason.trim()}
            >
              Update Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quota Adjustment Dialog */}
      <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Quota</DialogTitle>
            <DialogDescription>
              Change usage limits for this organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quota-type">Quota Type</Label>
              <select
                id="quota-type"
                value={quotaType}
                onChange={(e) => setQuotaType(e.target.value)}
                className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ai_messages">AI Messages</option>
                <option value="api_calls">API Calls</option>
                <option value="storage">Storage (GB)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="quota-limit">New Limit</Label>
              <Input
                id="quota-limit"
                type="number"
                placeholder="Enter new limit..."
                value={quotaLimit}
                onChange={(e) => setQuotaLimit(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="quota-reason">Reason</Label>
              <Textarea
                id="quota-reason"
                placeholder="E.g., Special request, testing purposes..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuotaDialog(false);
                setQuotaLimit("");
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuotaAdjustment}
              disabled={!quotaLimit || !reason.trim()}
            >
              Adjust Quota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
