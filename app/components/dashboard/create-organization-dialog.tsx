import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [isCreating, setIsCreating] = useState(false);

  const createOrganization = useMutation(api.organizations.createOrganization);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !slug) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);

    try {
      await createOrganization({
        name,
        slug,
        plan,
      });

      toast.success("Organization created successfully!");
      setName("");
      setSlug("");
      setPlan("free");
      onOpenChange(false);

      // Reload to reflect new organization
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to start collaborating with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Acme Corp"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isCreating}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">
                URL Slug
                <span className="ml-1 text-xs text-muted-foreground">
                  (auto-generated)
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">app.com/</span>
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isCreating}
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used in your organization's URL
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={plan}
                onValueChange={(value: "free" | "pro" | "enterprise") => setPlan(value)}
                disabled={isCreating}
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Free</span>
                      <span className="text-xs text-muted-foreground">
                        100 AI messages/month, 3 team members
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pro">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Pro</span>
                      <span className="text-xs text-muted-foreground">
                        10,000 AI messages/month, 25 team members
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Enterprise</span>
                      <span className="text-xs text-muted-foreground">
                        Unlimited everything
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
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
