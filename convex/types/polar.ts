/**
 * Type definitions for Polar.sh API responses
 * These types ensure type safety when working with Polar products and prices
 */

export interface PolarPrice {
  id: string;
  priceAmount: number;
  priceCurrency: string;
  recurringInterval?: string | null;
  type?: string;
}

export interface PolarProduct {
  id: string;
  name: string;
  description?: string | null;
  isRecurring: boolean;
  prices: PolarPrice[];
  isArchived?: boolean;
}

export interface CleanedPrice {
  id: string;
  amount: number;
  currency: string;
  interval?: string | null;
}

export interface CleanedProduct {
  id: string;
  name: string;
  description?: string | null;
  isRecurring: boolean;
  prices: CleanedPrice[];
}

export interface PolarProductListResponse {
  items: PolarProduct[];
  pagination: {
    totalCount: number;
    maxPage: number;
  };
}
