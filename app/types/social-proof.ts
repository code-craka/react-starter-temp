/**
 * Type definitions for Social Proof components
 */

export interface Stat {
  value: number;
  label: string;
  suffix: string;
}

export interface StatCardProps {
  stat: Stat;
  inView: boolean;
  delay: number;
}

export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export interface Company {
  name: string;
  logo: string;
}

export interface CompanyLogoProps {
  company: Company;
  delay: number;
}
