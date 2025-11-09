import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { MoreVertical, Plus, UserPlus, Loader2, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);

  // Get current user to find their organization
  const user = useQuery(api.users.findUserByToken, {
    tokenIdentifier: "", // This will be replaced with actual token
  });

  const organizationId = user?.organizationId as Id<"organizations"> | undefined;

  // Get team members
  const teamMembers = useQuery(
    api.organizations.getTeamMembers,
    organizationId ? { organizationId } : "skip"
  );

  // Get user's permission
  const permission = useQuery(
    api.organizations.checkPermission,
    organizationId ? { organizationId } : "skip"
  );

  const inviteTeamMember = useMutation(api.organizations.inviteTeamMember);
  const removeTeamMember = useMutation(api.organizations.removeTeamMember);
  const updateTeamMemberRole = useMutation(api.organizations.updateTeamMemberRole);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId || !email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);

    try {
      await inviteTeamMember({
        organizationId,
        userEmail: email,
        role,
      });

      toast.success("Team member invited successfully!");
      setEmail("");
      setRole("member");
      setInviteDialogOpen(false);
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite team member");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (membershipId: Id<"teamMembers">) => {
    if (!confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    try {
      await removeTeamMember({ membershipId });
      toast.success("Team member removed successfully!");
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove team member");
    }
  };

  const handleChangeRole = async (membershipId: Id<"teamMembers">, newRole: "admin" | "member") => {
    try {
      await updateTeamMemberRole({ membershipId, role: newRole });
      toast.success("Role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const isOwnerOrAdmin = permission?.role === "owner" || permission?.role === "admin";
  const isLoading = !teamMembers || !permission;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>

        {isOwnerOrAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isInviting}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value: "admin" | "member") => setRole(value)}
                      disabled={isInviting}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Member</span>
                            <span className="text-xs text-muted-foreground">
                              Can view and use resources
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Admin</span>
                            <span className="text-xs text-muted-foreground">
                              Can manage team and settings
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {teamMembers?.length || 0} member{teamMembers?.length !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member: any) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.image} />
                          <AvatarFallback>
                            {member.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.user?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.email || member.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "owner"
                            ? "default"
                            : member.role === "admin"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {member.role === "owner" && <Shield className="mr-1 h-3 w-3" />}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active"
                            ? "default"
                            : member.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isOwnerOrAdmin && member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== "admin" && (
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member._id, "admin")}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            {member.role === "admin" && permission?.role === "owner" && (
                              <DropdownMenuItem
                                onClick={() => handleChangeRole(member._id, "member")}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <UserPlus className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No team members yet</p>
              {isOwnerOrAdmin && (
                <p className="text-sm mt-1">Invite your first team member to get started</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
