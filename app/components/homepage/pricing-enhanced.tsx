"use client";
import { useAuth } from "@clerk/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, Loader2, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "../../../convex/_generated/api";
import { cn } from "~/lib/utils";
import type { PricingLoaderData } from "~/types/pricing";
import type { Plan, PlanPrice, PricingCard3DProps, ComparisonTableProps } from "~/types/pricing-cards";

export default function PricingEnhanced({ loaderData }: { loaderData: PricingLoaderData }) {
  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();

  const userSubscription = useQuery(api.subscriptions.fetchUserSubscription);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      await upsertUser();

      if (
        userSubscription?.status === "active" &&
        userSubscription?.customerId
      ) {
        const portalResult = await createPortalUrl({
          customerId: userSubscription.customerId,
        });
        window.open(portalResult.url, "_blank");
        setLoadingPriceId(null);
        return;
      }

      const checkoutUrl = await createCheckout({ priceId });
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Failed to process subscription action:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process request. Please try again.";
      setError(errorMessage);
      setLoadingPriceId(null);
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-32 bg-gradient-to-b from-background to-muted/20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl space-y-6 text-center mb-12 md:mb-20"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6 },
            },
          }}
        >
          <h1 className="text-4xl font-bold lg:text-5xl">
            Pricing that{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Scales with You
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include full access to our platform.
          </p>
        </motion.div>

        {!loaderData?.plans ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading plans...</span>
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {loaderData.plans.items
              .sort((a: Plan, b: Plan) => {
                const priceComparison = a.prices[0].amount - b.prices[0].amount;
                return priceComparison !== 0
                  ? priceComparison
                  : a.name.localeCompare(b.name);
              })
              .map((plan: Plan, index: number) => {
                const isPopular =
                  loaderData.plans.items.length === 2
                    ? index === 1
                    : index === Math.floor(loaderData.plans.items.length / 2);
                const price = plan.prices[0];
                const isCurrentPlan =
                  userSubscription?.status === "active" &&
                  userSubscription?.amount === price.amount;

                return (
                  <PricingCard3D
                    key={plan.id}
                    plan={plan}
                    price={price}
                    isPopular={isPopular}
                    isCurrentPlan={isCurrentPlan}
                    loadingPriceId={loadingPriceId}
                    userSubscription={userSubscription}
                    onSubscribe={handleSubscribe}
                    controls={controls}
                    delay={index * 0.1}
                  />
                );
              })}
          </div>
        )}

        {error && (
          <motion.div
            className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-800 text-center">{error}</p>
          </motion.div>
        )}

        {/* Comparison table */}
        <ComparisonTable controls={controls} />
      </div>
    </section>
  );
}

// 3D tilt pricing card
const PricingCard3D = memo(({
  plan,
  price,
  isPopular,
  isCurrentPlan,
  loadingPriceId,
  userSubscription,
  onSubscribe,
  controls,
  delay,
}: PricingCard3DProps) => {
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
  };

  const getPlanIcon = () => {
    if (plan.name.toLowerCase().includes("enterprise")) return Crown;
    if (plan.name.toLowerCase().includes("pro")) return Zap;
    return Star;
  };

  const Icon = getPlanIcon();

  return (
    <motion.div
      className="relative"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.6 },
        },
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, z: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect for popular plan */}
      {isPopular && (
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-75"
          animate={{
            opacity: [0.5, 0.75, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <Card
        className={cn(
          "relative h-full",
          isPopular ? "border-primary shadow-xl" : "",
          isCurrentPlan ? "border-green-500 bg-green-50/50" : ""
        )}
      >
        {isPopular && !isCurrentPlan && (
          <motion.span
            className="bg-gradient-to-r from-primary to-blue-600 text-white absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-4 py-1 text-xs font-medium shadow-lg"
            animate={{
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="h-3 w-3 mr-1" />
            Most Popular
          </motion.span>
        )}
        {isCurrentPlan && (
          <span className="bg-green-500 text-white absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium">
            ✓ Current Plan
          </span>
        )}

        <CardHeader className="text-center pb-8 pt-6">
          {/* Plan icon */}
          <motion.div
            className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-4",
              isPopular
                ? "bg-gradient-to-br from-primary to-blue-600"
                : "bg-muted"
            )}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className={cn("h-6 w-6", isPopular ? "text-white" : "text-primary")} />
          </motion.div>

          <CardTitle className="font-semibold text-2xl">{plan.name}</CardTitle>

          <div className="my-4">
            <span className="text-5xl font-bold">
              ${(price.amount / 100).toFixed(0)}
            </span>
            <span className="text-muted-foreground text-lg">
              {" "}/ {price.interval || "mo"}
            </span>
          </div>

          <CardDescription className="text-sm px-4">
            {plan.description}
          </CardDescription>

          <Button
            className={cn(
              "mt-6 w-full group",
              isPopular && "bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg"
            )}
            variant={
              isCurrentPlan
                ? "secondary"
                : isPopular
                ? "default"
                : "outline"
            }
            size="lg"
            onClick={() => onSubscribe(price.id)}
            disabled={loadingPriceId === price.id}
          >
            {loadingPriceId === price.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : isCurrentPlan ? (
              "✓ Current Plan"
            ) : userSubscription?.status === "active" ? (
              (() => {
                const currentAmount = userSubscription.amount || 0;
                const newAmount = price.amount;

                if (newAmount > currentAmount) {
                  return (
                    <>
                      Upgrade (+${((newAmount - currentAmount) / 100).toFixed(0)}/mo)
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  );
                } else if (newAmount < currentAmount) {
                  return `Downgrade (-$${((currentAmount - newAmount) / 100).toFixed(0)}/mo)`;
                } else {
                  return "Manage Plan";
                }
              })()
            ) : (
              <>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <hr className="border-dashed" />

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-green-500 flex-shrink-0" />
              All features included
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-green-500 flex-shrink-0" />
              Priority support
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-green-500 flex-shrink-0" />
              Cancel anytime
            </li>
            {plan.isRecurring && (
              <li className="flex items-center gap-2">
                <Check className="size-4 text-green-500 flex-shrink-0" />
                Recurring billing
              </li>
            )}
            <li className="flex items-center gap-2">
              <Check className="size-4 text-green-500 flex-shrink-0" />
              Real-time collaboration
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-green-500 flex-shrink-0" />
              Advanced analytics
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Plan comparison table
const ComparisonTable = memo(({ controls }: ComparisonTableProps) => {
  return (
    <motion.div
      className="mt-20 md:mt-32"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: 0.8, duration: 0.6 },
        },
      }}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Compare Plans
      </h3>
      <div className="bg-background border rounded-2xl p-6 md:p-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 pr-4">Feature</th>
              <th className="text-center py-4 px-4">Free</th>
              <th className="text-center py-4 px-4">Pro</th>
              <th className="text-center py-4 px-4">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: "Team Members", free: "Up to 3", pro: "Up to 25", enterprise: "Unlimited" },
              { feature: "Projects", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
              { feature: "Storage", free: "1GB", pro: "100GB", enterprise: "Unlimited" },
              { feature: "AI Features", free: "Basic", pro: "Advanced", enterprise: "Premium" },
              { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
            ].map((row, idx) => (
              <motion.tr
                key={idx}
                className="border-b last:border-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
              >
                <td className="py-4 pr-4 font-medium">{row.feature}</td>
                <td className="text-center py-4 px-4 text-muted-foreground">{row.free}</td>
                <td className="text-center py-4 px-4 text-muted-foreground">{row.pro}</td>
                <td className="text-center py-4 px-4 text-muted-foreground">{row.enterprise}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
});
