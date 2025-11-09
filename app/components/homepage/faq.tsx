"use client";
import { memo, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, HelpCircle, ChevronDown, Zap, Shield, CreditCard, Users, Code, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const faqData = [
  {
    id: "1",
    category: "general",
    icon: HelpCircle,
    question: "What is Taskcoda?",
    answer: "Taskcoda is a modern task management and collaboration platform designed to help teams stay organized, productive, and connected. It combines powerful project management tools with real-time collaboration features, AI-powered assistance, and comprehensive analytics.",
  },
  {
    id: "2",
    category: "features",
    icon: Zap,
    question: "What features does Taskcoda offer?",
    answer: "Taskcoda offers a comprehensive suite of features including real-time task management, team collaboration tools, AI-powered chat assistant, advanced analytics, custom workflows, integrations with popular tools, mobile apps, and enterprise-grade security. All features are available across all paid plans.",
  },
  {
    id: "3",
    category: "pricing",
    icon: CreditCard,
    question: "How does pricing work?",
    answer: "We offer three plans: Free (up to 3 team members, 5 projects), Pro (up to 25 team members, unlimited projects), and Enterprise (unlimited everything). All plans include full feature access, with differences in team size, storage, and support level. You can upgrade or downgrade at any time.",
  },
  {
    id: "4",
    category: "pricing",
    icon: CreditCard,
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time from your billing dashboard. Your access will continue until the end of your current billing period, and you won't be charged again. You can also downgrade to our free plan to keep your data accessible.",
  },
  {
    id: "5",
    category: "security",
    icon: Shield,
    question: "Is my data secure?",
    answer: "Absolutely. We take security seriously with enterprise-grade encryption (AES-256) for data at rest, TLS 1.3 for data in transit, SOC 2 compliance, GDPR compliance, regular security audits, and comprehensive audit logging. Your data is stored securely and backed up daily.",
  },
  {
    id: "6",
    category: "security",
    icon: Shield,
    question: "Do you comply with GDPR and other privacy regulations?",
    answer: "Yes, we are fully GDPR compliant and follow strict privacy regulations. We provide data export capabilities, right to deletion, transparent data processing, and detailed privacy policies. We never sell your data to third parties.",
  },
  {
    id: "7",
    category: "teams",
    icon: Users,
    question: "How do team permissions work?",
    answer: "Taskcoda uses role-based access control (RBAC) with three levels: Owner (full control), Admin (manage members and settings), and Member (basic access). You can invite team members via email, and they can accept invitations to join your organization with their assigned role.",
  },
  {
    id: "8",
    category: "teams",
    icon: Users,
    question: "Can I have multiple organizations?",
    answer: "Yes! You can create and be a member of multiple organizations. Each organization has its own billing, members, projects, and settings. You can easily switch between organizations from the dashboard.",
  },
  {
    id: "9",
    category: "integrations",
    icon: Code,
    question: "What integrations are available?",
    answer: "Taskcoda integrates with popular tools including Slack, GitHub, Google Drive, Dropbox, Zapier, and many more. We also provide a REST API and webhooks for custom integrations. New integrations are added regularly based on user feedback.",
  },
  {
    id: "10",
    category: "support",
    icon: MessageCircle,
    question: "What kind of support do you offer?",
    answer: "Free plans include community support via our help center and documentation. Pro plans get priority email support with 24-hour response time. Enterprise plans include dedicated support with phone/video calls and a dedicated account manager.",
  },
  {
    id: "11",
    category: "general",
    icon: HelpCircle,
    question: "Do you offer a free trial?",
    answer: "Our Free plan is available forever with no credit card required. For Pro and Enterprise features, you can try them with our 14-day money-back guarantee. Simply subscribe and if you're not satisfied, request a full refund within 14 days.",
  },
  {
    id: "12",
    category: "features",
    icon: Zap,
    question: "Does Taskcoda work offline?",
    answer: "Yes! Our progressive web app (PWA) and mobile apps support offline mode. You can view and edit tasks while offline, and changes will automatically sync when you reconnect to the internet.",
  },
];

const categories = [
  { id: "all", label: "All", icon: HelpCircle },
  { id: "general", label: "General", icon: HelpCircle },
  { id: "features", label: "Features", icon: Zap },
  { id: "pricing", label: "Pricing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "teams", label: "Teams", icon: Users },
  { id: "integrations", label: "Integrations", icon: Code },
  { id: "support", label: "Support", icon: MessageCircle },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredFAQs, setFilteredFAQs] = useState(faqData);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFAQs(filtered);
  }, [searchQuery, selectedCategory]);

  return (
    <section id="faq" className="py-16 md:py-32 bg-gradient-to-b from-muted/20 to-background" ref={ref}>
      <div className="mx-auto max-w-5xl px-6">
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
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 mx-auto mb-4"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <HelpCircle className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold lg:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Taskcoda. Can't find the answer you're looking for?{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.2, duration: 0.6 },
            },
          }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-primary transition-colors"
            />
          </div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8 justify-center"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.3, duration: 0.6 },
            },
          }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{category.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Results count */}
        {searchQuery && (
          <motion.div
            className="mb-4 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Found {filteredFAQs.length} {filteredFAQs.length === 1 ? "result" : "results"}
          </motion.div>
        )}

        {/* FAQ Accordion */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.4, duration: 0.6 },
            },
          }}
        >
          {filteredFAQs.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or selecting a different category
              </p>
            </motion.div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq, index) => {
                const Icon = faq.icon;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="border-2 border-border rounded-xl px-6 bg-background hover:border-primary/50 transition-colors"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-6 group">
                        <div className="flex items-start gap-4 pr-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                              {faq.question}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {categories.find((c) => c.id === faq.category)?.label}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-14 pr-4 pb-6 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-16 text-center"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.6, duration: 0.6 },
            },
          }}
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 border-2 border-primary/20">
            <MessageCircle className="h-12 w-12 text-primary" />
            <h3 className="text-2xl font-bold">Still have questions?</h3>
            <p className="text-muted-foreground max-w-md">
              Our support team is here to help. Reach out and we'll get back to you as soon as possible.
            </p>
            <motion.a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
