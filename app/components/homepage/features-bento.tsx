"use client";
import { memo, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Zap,
  Shield,
  Users,
  BarChart3,
  Sparkles,
  Rocket,
  Clock,
  Lock,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import type { Feature, FeatureCardProps, LargeFeatureCardProps } from "~/types/features";
const features = {
  collaboration: [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and shared workspaces",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant help and suggestions powered by advanced AI",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent task scheduling that adapts to your workflow",
      color: "from-green-500 to-emerald-500",
    },
  ],
  productivity: [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time sync across all devices with zero lag",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and achieve your goals with visual progress tracking",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Track time spent on tasks and optimize your productivity",
      color: "from-indigo-500 to-blue-500",
    },
  ],
  security: [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2, GDPR, and HIPAA compliant with end-to-end encryption",
      color: "from-gray-500 to-slate-500",
    },
    {
      icon: Lock,
      title: "Role-Based Access",
      description: "Granular permissions and access controls for your team",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into team performance and productivity metrics",
      color: "from-teal-500 to-cyan-500",
    },
  ],
};

export default function FeaturesBento() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();
  const [activeTab, setActiveTab] = useState("collaboration");

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section id="features" className="py-16 md:py-32 bg-gradient-to-b from-background to-muted/20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-20"
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
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              succeed
            </span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Powerful features designed to help your team collaborate better and achieve more
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.3 } },
          }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="collaboration">
                <Users className="h-4 w-4 mr-2" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="productivity">
                <Rocket className="h-4 w-4 mr-2" />
                Productivity
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {Object.entries(features).map(([key, featureList]) => (
              <TabsContent key={key} value={key}>
                {/* Bento grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featureList.map((feature, idx) => (
                    <FeatureCard
                      key={idx}
                      feature={feature}
                      delay={idx * 0.1}
                      controls={controls}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Large feature showcase */}
        <motion.div
          className="mt-16 md:mt-24 grid md:grid-cols-2 gap-6"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.6, duration: 0.6 },
            },
          }}
        >
          {/* Left large card */}
          <LargeFeatureCard
            icon={TrendingUp}
            title="Real-time Analytics Dashboard"
            description="Get instant insights into team performance, project progress, and productivity metrics with our advanced analytics engine."
            gradient="from-violet-600 to-indigo-600"
          />

          {/* Right large card */}
          <LargeFeatureCard
            icon={Rocket}
            title="Launch in Minutes"
            description="Get started immediately with pre-built templates, automated workflows, and intelligent defaults that adapt to your needs."
            gradient="from-orange-600 to-pink-600"
          />
        </motion.div>
      </div>
    </section>
  );
}

// Feature card with 3D tilt effect
const FeatureCard = memo(({
  feature,
  delay,
  controls,
}: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay, duration: 0.5 },
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-500",
          feature.color
        )}
      />

      {/* Card content */}
      <div className="relative bg-background border rounded-xl p-6 h-full hover:border-primary/50 transition-all duration-300">
        {/* Icon */}
        <motion.div
          className={cn(
            "inline-flex p-3 rounded-lg bg-gradient-to-br mb-4",
            feature.color
          )}
          animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <feature.icon className="h-6 w-6 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {feature.description}
        </p>

        {/* Hover indicator */}
        <motion.div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          animate={isHovered ? { x: 0 } : { x: -10 }}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// Large feature card
const LargeFeatureCard = memo(({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}) => {
  return (
    <motion.div
      className="relative group overflow-hidden rounded-2xl"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", gradient)} />

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              right: -50 - i * 25,
              top: -50 - i * 25,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-10 text-white">
        <motion.div
          className="inline-flex p-4 rounded-xl bg-white/20 backdrop-blur-sm mb-4"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.7 }}
        >
          <Icon className="h-8 w-8" />
        </motion.div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3">{title}</h3>
        <p className="text-white/90 text-lg mb-6 leading-relaxed">{description}</p>

        <Button variant="secondary" size="lg" className="group">
          Learn More
          <motion.span
            className="ml-2 inline-block"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </Button>
      </div>
    </motion.div>
  );
});
