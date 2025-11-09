/**
 * Type definitions for Pricing components
 */

export interface PricingLoaderData {
  isSignedIn: boolean;
  hasActiveSubscription: boolean;
  plans: {
    items: Array<{
      id: string;
      name: string;
      description?: string | null;
      isRecurring: boolean;
      prices: Array<{
        id: string;
        amount: number;
        currency: string;
        interval?: string | null;
      }>;
    }>;
    pagination: {
      totalCount: number;
      maxPage: number;
    };
  };
}
