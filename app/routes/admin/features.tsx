import { useMutation, useQuery } from "convex/react";
import { Flag, Plus, Trash2, Percent } from "lucide-react";
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
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/features";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feature Flags - Admin" },
    { name: "description", content: "Manage feature flags" },
  ];
}

export default function FeatureFlagsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);

  // Form state for create
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);

  const flags = useQuery(api.admin.listFeatureFlags);
  const createFlag = useMutation(api.admin.createFeatureFlag);
  const updateFlag = useMutation(api.admin.updateFeatureFlag);
  const deleteFlag = useMutation(api.admin.deleteFeatureFlag);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createFlag({
        name: name.trim(),
        description: description.trim(),
        enabled,
        rolloutPercentage,
      });
      toast.success("Feature flag created successfully");
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to create feature flag");
    }
  };

  const handleToggle = async (flagId: string, currentEnabled: boolean) => {
    try {
      await updateFlag({
        flagId: flagId as any,
        enabled: !currentEnabled,
      });
      toast.success(`Feature flag ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update feature flag");
    }
  };

  const handleUpdateRollout = async () => {
    if (!selectedFlag) return;

    try {
      await updateFlag({
        flagId: selectedFlag._id,
        rolloutPercentage,
      });
      toast.success("Rollout percentage updated");
      setShowEditDialog(false);
      setSelectedFlag(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update rollout percentage");
    }
  };

  const handleDelete = async () => {
    if (!selectedFlag) return;

    try {
      await deleteFlag({ flagId: selectedFlag._id });
      toast.success("Feature flag deleted");
      setShowDeleteDialog(false);
      setSelectedFlag(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete feature flag");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEnabled(false);
    setRolloutPercentage(0);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Feature Flags</h2>
          <p className="text-muted-foreground">
            Manage feature flags and gradual rollouts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Flag
        </Button>
      </div>

      {/* Feature Flags List */}
      {flags === undefined ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Flag className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No Feature Flags</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first feature flag to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {flags.map((flag: any) => (
            <Card key={flag._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      <Badge
                        variant={flag.enabled ? "default" : "outline"}
                        className={
                          flag.enabled
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {flag.organizationId && (
                        <Badge variant="outline">Organization-Specific</Badge>
                      )}
                    </div>
                    <CardDescription>{flag.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag._id, flag.enabled)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rollout Percentage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">
                        Rollout Percentage
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {flag.rolloutPercentage || 0}%
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedFlag(flag);
                            setRolloutPercentage(flag.rolloutPercentage || 0);
                            setShowEditDialog(true);
                          }}
                        >
                          <Percent className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${flag.rolloutPercentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Created {formatDate(flag.createdAt)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedFlag(flag);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Create a new feature flag for gradual rollout or A/B testing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="flag-name">Name *</Label>
              <Input
                id="flag-name"
                placeholder="e.g., advanced_analytics, new_ui"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use snake_case for flag names
              </p>
            </div>
            <div>
              <Label htmlFor="flag-description">Description *</Label>
              <Textarea
                id="flag-description"
                placeholder="Describe what this feature flag controls..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="flag-enabled">Enable Immediately</Label>
                <p className="text-xs text-muted-foreground">
                  Turn on this feature flag after creation
                </p>
              </div>
              <Switch
                id="flag-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Rollout Percentage</Label>
                <span className="text-sm font-bold">{rolloutPercentage}%</span>
              </div>
              <Slider
                value={[rolloutPercentage]}
                onValueChange={([value]) => setRolloutPercentage(value)}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0% = disabled, 100% = enabled for all users
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || !description.trim()}
            >
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rollout Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Rollout Percentage</DialogTitle>
            <DialogDescription>
              Adjust the gradual rollout percentage for this feature
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">{selectedFlag.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFlag.description}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Rollout Percentage</Label>
                  <span className="text-sm font-bold">{rolloutPercentage}%</span>
                </div>
                <Slider
                  value={[rolloutPercentage]}
                  onValueChange={([value]) => setRolloutPercentage(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This controls what percentage of users will see this feature
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedFlag(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRollout}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feature Flag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feature flag? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="p-4 border rounded-lg">
              <p className="font-medium">{selectedFlag.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFlag.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedFlag(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
