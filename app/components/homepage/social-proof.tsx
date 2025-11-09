"use client";
import { memo, useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView as useFramerInView } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { StatCardProps, TestimonialCarouselProps, TestimonialCardProps, CompanyLogoProps } from "~/types/social-proof";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechCorp",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "Taskcoda transformed how our team collaborates. We've seen a 40% increase in productivity and our projects are delivered faster than ever.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Product Manager at StartupXYZ",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "The AI-powered features are game-changing. It's like having an extra team member who never sleeps and always knows what needs to be done next.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Engineering Lead at DevCo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content:
      "We tried 5 other tools before Taskcoda. Nothing comes close to the ease of use and powerful features. Our entire team is now on board.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Founder at GrowthLabs",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "The real-time collaboration features are incredible. Our remote team feels more connected than ever, and deadlines are met consistently.",
    rating: 5,
  },
  {
    name: "Jessica Martinez",
    role: "Operations Director at ScaleUp",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    content:
      "Taskcoda's analytics give us insights we never had before. We can now identify bottlenecks and optimize our workflow continuously.",
    rating: 5,
  },
];

const stats = [
  { value: 1000, label: "Teams Trust Taskcoda", suffix: "+" },
  { value: 50000, label: "Tasks Completed", suffix: "+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
  { value: 24, label: "Support Response", suffix: "h" },
];

const companyLogos = [
  { name: "TechCorp", logo: "TC" },
  { name: "StartupXYZ", logo: "SX" },
  { name: "DevCo", logo: "DC" },
  { name: "GrowthLabs", logo: "GL" },
  { name: "ScaleUp", logo: "SU" },
  { name: "InnovateNow", logo: "IN" },
];

export default function SocialProof() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section id="social-proof" className="py-16 md:py-32 bg-muted/50" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 md:mb-24"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} inView={inView} delay={idx * 0.1} />
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          className="mb-16 md:mb-24"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.5 } },
          }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                thousands
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our customers have to say
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </motion.div>

        {/* Company Logos */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.7 },
            },
          }}
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companyLogos.map((company, idx) => (
              <CompanyLogo key={idx} company={company} delay={idx * 0.1} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated stat card with counter
const StatCard = memo(({ stat, inView, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true });

  useEffect(() => {
    if (isInView && inView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, inView, stat.value]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { delay, duration: 0.5 },
        },
      }}
    >
      <motion.div
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {stat.suffix === "%" ? count.toFixed(1) : count.toLocaleString()}
        {stat.suffix}
      </motion.div>
      <div className="text-sm md:text-base text-muted-foreground">
        {stat.label}
      </div>
    </motion.div>
  );
});

// Testimonial carousel
const TestimonialCarousel = memo(({ testimonials }: TestimonialCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4"
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            className={cn(
              "h-2 rounded-full transition-all",
              idx === selectedIndex % 5
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30"
            )}
            onClick={() => emblaApi?.scrollTo(idx)}
          />
        ))}
      </div>
    </div>
  );
});

// Individual testimonial card
const TestimonialCard = memo(({ testimonial }: TestimonialCardProps) => {
  return (
    <motion.div
      className="bg-background border rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
      whileHover={{ y: -5 }}
    >
      {/* Quote icon */}
      <Quote className="h-8 w-8 text-primary/20 mb-4" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-muted-foreground mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-sm">{testimonial.name}</div>
          <div className="text-xs text-muted-foreground">
            {testimonial.role}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Company logo with grayscale hover effect
const CompanyLogo = memo(({ company, delay }: CompanyLogoProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex items-center justify-center w-24 h-12 bg-muted rounded-lg transition-all duration-300",
          isHovered ? "grayscale-0 scale-110" : "grayscale opacity-50"
        )}
      >
        <span className="text-xl font-bold text-foreground">{company.logo}</span>
      </div>
    </motion.div>
  );
});
