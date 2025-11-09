import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { UsageDashboard } from "~/components/dashboard/usage-dashboard";

export default function UsagePage() {
  // Get current user to find their organization
  const user = useQuery(api.users.findUserByToken, {
    tokenIdentifier: "", // This will be replaced with actual token
  });

  const organizationId = user?.organizationId as Id<"organizations"> | undefined;

  if (!organizationId) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">No Organization</h2>
          <p className="text-muted-foreground">
            Create or join an organization to view usage metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <UsageDashboard organizationId={organizationId} />
    </div>
  );
}
