/**
 * Type definitions for Features components
 */
import type { useAnimation } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface FeatureCardProps {
  feature: Feature;
  delay: number;
  controls: ReturnType<typeof useAnimation>;
}

export interface LargeFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay: number;
  controls: ReturnType<typeof useAnimation>;
}
