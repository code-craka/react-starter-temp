/**
 * Type definitions for User-related components
 */

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role?: "owner" | "admin" | "member";
}

export interface NavUserProps {
  user: DashboardUser;
}
