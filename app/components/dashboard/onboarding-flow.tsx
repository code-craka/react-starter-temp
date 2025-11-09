import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Building2, Users, Rocket, CheckCircle2 } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free");

  const createOrganization = useMutation(api.organizations.createOrganization);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setOrgName(value);
    if (!orgSlug || orgSlug === generateSlug(orgName)) {
      setOrgSlug(generateSlug(value));
    }
  };

  const handleNext = () => {
    if (step === 1 && !orgName) {
      toast.error("Please enter an organization name");
      return;
    }
    if (step === 1 && !orgSlug) {
      toast.error("Please enter an organization slug");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!orgName || !orgSlug) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrganization({
        name: orgName,
        slug: orgSlug,
        plan,
      });

      toast.success("Organization created successfully!");
      setStep(totalSteps + 1); // Show success step

      // Complete onboarding after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        {step <= totalSteps && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step 1: Organization Name */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Your Organization</CardTitle>
              <CardDescription>
                Let's start by setting up your organization workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Acme Corporation"
                  value={orgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This is the name of your company or team
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSlug">
                  URL Slug
                  <span className="ml-1 text-xs text-muted-foreground">(auto-generated)</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">yourapp.com/</span>
                  <Input
                    id="orgSlug"
                    placeholder="acme-corporation"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be used in your organization's URL
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" disabled>
                Back
              </Button>
              <Button onClick={handleNext}>Continue</Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Choose Your Plan</CardTitle>
              <CardDescription>
                Select the plan that best fits your needs. You can upgrade anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Free Plan */}
                <button
                  onClick={() => setPlan("free")}
                  className={`text-left rounded-lg border-2 p-4 transition-all ${
                    plan === "free"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Free</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Perfect for trying out
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          100 AI messages/month
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          3 team members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Basic support
                        </li>
                      </ul>
                    </div>
                    <div className="text-2xl font-bold">$0</div>
                  </div>
                </button>

                {/* Pro Plan */}
                <button
                  onClick={() => setPlan("pro")}
                  className={`text-left rounded-lg border-2 p-4 transition-all ${
                    plan === "pro"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Pro</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        For growing teams
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          10,000 AI messages/month
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          25 team members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Priority support
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">$29</div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  </div>
                </button>

                {/* Enterprise Plan */}
                <button
                  onClick={() => setPlan("enterprise")}
                  className={`text-left rounded-lg border-2 p-4 transition-all ${
                    plan === "enterprise"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Enterprise</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        For large organizations
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Unlimited everything
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Unlimited team members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          24/7 premium support
                        </li>
                      </ul>
                    </div>
                    <div className="text-lg font-bold">Custom</div>
                  </div>
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>Continue</Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Review Your Setup</CardTitle>
              <CardDescription>
                Everything looks good? Let's create your organization!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Organization Name</span>
                  <span className="font-medium">{orgName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">URL Slug</span>
                  <span className="font-mono text-sm">{orgSlug}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium capitalize">{plan}</span>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Your organization workspace will be created
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    You'll be redirected to your dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    You can start inviting team members
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Success Step */}
        {step > totalSteps && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">All Set! 🎉</CardTitle>
              <CardDescription>
                Your organization has been created successfully. Redirecting to your dashboard...
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
