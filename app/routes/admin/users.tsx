import { useMutation, useQuery } from "convex/react";
import { Search, UserX, UserCheck, Eye, AlertTriangle } from "lucide-react";
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
import type { Route } from "./+types/users";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Management - Admin" },
    { name: "description", content: "Manage users" },
  ];
}

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [suspendedFilter, setSuspendedFilter] = useState<boolean | undefined>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const users = useQuery(api.admin.searchUsers, {
    searchQuery,
    role: roleFilter,
    suspended: suspendedFilter,
    limit: 50,
    offset: 0,
  });

  const userDetails = useQuery(
    api.admin.getUserDetails,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );

  const suspendUser = useMutation(api.admin.suspendUser);
  const activateUser = useMutation(api.admin.activateUser);

  const handleSuspend = async () => {
    if (!selectedUserId || !suspendReason.trim()) {
      toast.error("Please provide a reason for suspending this user");
      return;
    }

    try {
      await suspendUser({ userId: selectedUserId, reason: suspendReason });
      toast.success("User suspended successfully");
      setShowSuspendDialog(false);
      setSuspendReason("");
      setSelectedUserId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to suspend user");
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser({ userId });
      toast.success("User activated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to activate user");
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const getRoleBadge = (role?: string) => {
    if (role === "super_admin") {
      return <Badge variant="destructive">Super Admin</Badge>;
    } else if (role === "admin") {
      return <Badge>Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Search, view, and manage user accounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>Find users by name, email, or ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter || ""}
              onChange={(e) => setRoleFilter(e.target.value || undefined)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={suspendedFilter === undefined ? "" : suspendedFilter ? "suspended" : "active"}
              onChange={(e) =>
                setSuspendedFilter(
                  e.target.value === "" ? undefined : e.target.value === "suspended"
                )
              }
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users {users && `(${users.total})`}
          </CardTitle>
          <CardDescription>
            {users?.hasMore && `Showing first ${users.users.length} results`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.name || "Unknown"}
                    </TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUserId(user.tokenIdentifier);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role !== "super_admin" && (
                          <>
                            {user.isSuspended ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleActivate(user.tokenIdentifier)}
                              >
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUserId(user.tokenIdentifier);
                                  setShowSuspendDialog(true);
                                }}
                              >
                                <UserX className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user information, activity, and subscription details
            </DialogDescription>
          </DialogHeader>
          {userDetails === undefined ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm mt-1">{userDetails.user.name || "Unknown"}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm mt-1">{userDetails.user.email || "N/A"}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="mt-1">{getRoleBadge(userDetails.user.role)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {userDetails.user.isSuspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm mt-1">
                    {formatDate(userDetails.user.createdAt)}
                  </p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm mt-1">
                    {formatDate(userDetails.user.lastLoginAt)}
                  </p>
                </div>
              </div>

              {/* Organization */}
              {userDetails.organization && (
                <div>
                  <Label>Organization</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{userDetails.organization.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Plan: {userDetails.organization.plan || "free"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Usage Metrics */}
              {userDetails.usageMetrics && userDetails.usageMetrics.length > 0 && (
                <div>
                  <Label>Usage Metrics (Current Month)</Label>
                  <div className="mt-2 space-y-2">
                    {userDetails.usageMetrics.map((metric) => (
                      <div
                        key={metric._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm font-medium capitalize">
                          {metric.metricType.replace("_", " ")}
                        </span>
                        <span className="text-sm">{metric.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {userDetails.auditLogs && userDetails.auditLogs.length > 0 && (
                <div>
                  <Label>Recent Activity</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {userDetails.auditLogs.map((log) => (
                      <div
                        key={log._id}
                        className="flex items-start gap-3 p-3 border rounded-lg text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-muted-foreground">{log.resource}</p>
                        </div>
                        <div className="text-right text-muted-foreground text-xs">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              User not found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Suspend User
            </DialogTitle>
            <DialogDescription>
              This will prevent the user from accessing the application. Provide a reason for this action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for suspension</Label>
              <Textarea
                id="reason"
                placeholder="E.g., Violated terms of service, suspicious activity..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendDialog(false);
                setSuspendReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
