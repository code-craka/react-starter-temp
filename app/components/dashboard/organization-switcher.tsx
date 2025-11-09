import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { cn } from "~/lib/utils";
import type { Id } from "convex/_generated/dataModel";

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Get current user to find their active organization
  const user = useQuery(api.users.findUserByToken, {
    tokenIdentifier: "", // This will be replaced with actual token
  });

  // Get all organizations user belongs to
  const organizations = useQuery(api.organizations.getUserOrganizations);

  // Find current organization
  const currentOrg = organizations?.find((org) => org._id === user?.organizationId);

  if (!organizations || organizations.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={cn("w-full justify-start", className)}
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
        <CreateOrganizationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                {currentOrg?.name?.charAt(0).toUpperCase() || "O"}
              </div>
              <span className="truncate">{currentOrg?.name || "Select org"}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              onSelect={() => {
                // TODO: Switch to this organization
                window.location.reload(); // Temporary - replace with proper switching
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                    {org.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{org.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {org.role} · {org.plan || "free"}
                    </span>
                  </div>
                </div>
                {org._id === currentOrg?._id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setOpen(false);
              setShowCreateDialog(true);
            }}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
