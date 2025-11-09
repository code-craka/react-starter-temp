/**
 * Type definitions for Clerk user objects
 * Based on Clerk's UserResource type
 */

export interface ClerkEmailAddress {
  emailAddress: string;
  id: string;
}

export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: ClerkEmailAddress[];
  imageUrl: string;
  username?: string | null;
  primaryEmailAddressId?: string | null;
}

export interface NavUserProps {
  user: ClerkUser;
}

export interface AppSidebarData {
  user: ClerkUser;
}
