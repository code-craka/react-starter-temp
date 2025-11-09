/**
 * Type definitions for Pricing card components
 */
import type { useAnimation } from "framer-motion";

export interface PlanPrice {
  id: string;
  amount: number;
  currency: string;
  interval?: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  isRecurring: boolean;
  prices: PlanPrice[];
}

export interface PricingCard3DProps {
  plan: Plan;
  price: PlanPrice;
  isPopular: boolean;
  isCurrentPlan: boolean;
  loadingPriceId: string | null;
  userSubscription: {
    status?: string;
    polarPriceId?: string;
    amount?: number;
  } | null | undefined;
  onSubscribe: (priceId: string) => Promise<void>;
  controls: ReturnType<typeof useAnimation>;
  delay: number;
}

export interface ComparisonTableProps {
  controls: ReturnType<typeof useAnimation>;
}
