/**
 * Type definitions for Organization-related components
 */
import type { Id } from "../../convex/_generated/dataModel";

export type OrganizationId = Id<"organizations">;

export interface BillingManagementProps {
  organizationId: OrganizationId;
}

export interface SubscriptionStatusProps {
  organizationId: OrganizationId;
}
