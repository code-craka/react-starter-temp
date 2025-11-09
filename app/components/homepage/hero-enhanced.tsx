"use client";
import { memo, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { LogoIcon } from "~/components/logo";
import {
  Convex,
  Polar,
  ReactIcon,
  ReactRouter,
  TailwindIcon,
  Typescript,
} from "~/components/logos";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Navbar } from "./navbar";
import { Sparkles, Zap, Rocket } from "lucide-react";

// Custom hook to inject gradient animation styles (client-side only)
function useGradientStyles() {
  useEffect(() => {
    // Only run on client side
    const style = document.createElement('style');
    style.id = 'gradient-animation-styles';
    style.textContent = `
      @keyframes gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient {
        animation: gradient 3s ease infinite;
      }
      .bg-300\\% { background-size: 300% 300%; }
    `;
    document.head.appendChild(style);

    // Cleanup: remove style tag on unmount
    return () => {
      const existingStyle = document.getElementById('gradient-animation-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
}

export default function HeroEnhanced({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();

  // Inject gradient animation styles on client side only
  useGradientStyles();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section id="hero" ref={ref}>
      <Navbar loaderData={loaderData} />
      <div className="bg-muted dark:bg-background py-24 md:py-32 relative overflow-hidden">
        {/* Animated background shapes */}
        <FloatingShapes />

        <div className="mx-auto max-w-5xl px-6 mt-[2rem] relative z-10">
          <div className="grid items-center sm:grid-cols-2 gap-8">
            {/* Left side - Tech stack with parallax */}
            <motion.div
              className="dark:bg-muted/50 relative mx-auto w-fit"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <div className="bg-radial to-muted dark:to-background absolute inset-0 z-10 from-transparent to-75%"></div>

              {/* Top row */}
              <motion.div
                className="mx-auto mb-2 flex w-fit justify-center gap-2"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <IntegrationCard delay={0.1}>
                  <ReactRouter />
                </IntegrationCard>
                <IntegrationCard delay={0.2}>
                  <Convex />
                </IntegrationCard>
              </motion.div>

              {/* Middle row */}
              <motion.div
                className="mx-auto my-2 flex w-fit justify-center gap-2"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <IntegrationCard delay={0.3}>
                  <ReactIcon />
                </IntegrationCard>
                <IntegrationCard
                  borderClassName="shadow-black-950/10 shadow-xl border-black/25 dark:border-white/25"
                  className="dark:bg-white/10"
                  delay={0.4}
                >
                  <LogoIcon />
                </IntegrationCard>
                <IntegrationCard delay={0.5}>
                  <TailwindIcon />
                </IntegrationCard>
              </motion.div>

              {/* Bottom row */}
              <motion.div
                className="mx-auto flex w-fit justify-center gap-2"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <IntegrationCard delay={0.6}>
                  <Typescript />
                </IntegrationCard>
                <IntegrationCard delay={0.7}>
                  <Polar />
                </IntegrationCard>
              </motion.div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              className="mx-auto mt-6 max-w-lg space-y-6 text-center sm:mt-0 sm:text-left"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    duration: 0.6,
                    delay: 0.3,
                  },
                },
              }}
            >
              {/* Shimmer gradient text */}
              <h2 className="text-balance text-4xl font-bold md:text-5xl lg:text-6xl relative">
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-300%">
                  Taskcoda
                </span>
                <motion.span
                  className="absolute -top-6 -right-6"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.span>
              </h2>

              <motion.p
                className="text-muted-foreground text-lg md:text-xl"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                Modern task management and productivity platform built for teams who want to{" "}
                <span className="text-primary font-semibold">work smarter</span>, not harder.
              </motion.p>

              {/* Features list */}
              <motion.div
                className="flex flex-wrap gap-3 text-sm"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delay: 0.5 },
                  },
                }}
              >
                {[
                  { icon: Rocket, text: "Launch in minutes" },
                  { icon: Zap, text: "Lightning fast" },
                  { icon: Sparkles, text: "AI-powered" },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm border rounded-full px-3 py-1.5"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                  >
                    <feature.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons with glow effect */}
              <motion.div
                className="flex gap-3"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <GlowButton
                  asChild
                  size="lg"
                >
                  <Link
                    to={
                      loaderData?.isSignedIn
                        ? loaderData?.hasActiveSubscription
                          ? "/dashboard"
                          : "/pricing"
                        : "/sign-up"
                    }
                    prefetch="viewport"
                  >
                    {loaderData?.isSignedIn
                      ? loaderData?.hasActiveSubscription
                        ? "Go to Dashboard"
                        : "Choose a Plan"
                      : "Get Started Free"}
                  </Link>
                </GlowButton>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Floating geometric shapes in background
const FloatingShapes = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          <div
            className={cn(
              "bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full blur-xl",
              i % 2 === 0 ? "h-32 w-32" : "h-24 w-24"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
});

// Integration card with hover tilt effect
const IntegrationCard = memo(({
  children,
  className,
  borderClassName,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      className={cn(
        "bg-background relative flex size-20 rounded-xl dark:bg-transparent cursor-pointer",
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div
        role="presentation"
        className={cn(
          "absolute inset-0 rounded-xl border border-black/20 dark:border-white/25 transition-all",
          isHovered && "border-primary/50 shadow-lg shadow-primary/20",
          borderClassName
        )}
      />
      <div className="relative z-20 m-auto size-fit *:size-8">{children}</div>
    </motion.div>
  );
});

// Glow button component
const GlowButton = memo(({ children, className, ...props }: any) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      <Button
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
});
