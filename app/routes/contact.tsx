import { type MetaFunction } from "react-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { LegalLayout } from "~/components/legal/legal-layout";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact Us - Taskcoda by TechSci, Inc." },
    { name: "description", content: "Get in touch with TechSci, Inc. for support, inquiries, or feedback about Taskcoda." },
  ];
};

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitContact = useMutation(api.contact.submitContactForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContact(formData);
      toast.success("Message sent successfully! We'll respond within 24-48 hours.");
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <LegalLayout title="Contact Us" lastUpdated={lastUpdated}>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>We typically respond within 24-48 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <h3 className="text-xl font-semibold">Thank You!</h3>
                <p className="text-muted-foreground">
                  Your message has been received. We'll get back to you within 24-48 hours.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description"
                    required
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    required
                    maxLength={2000}
                    rows={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">{formData.message.length}/2000 characters</p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Rate limit: 5 messages per hour per email address
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">TechSci, Inc.</p>
                  <p className="text-sm text-muted-foreground">1111B S Governors Ave STE 34002</p>
                  <p className="text-sm text-muted-foreground">Dover, DE 19904</p>
                  <p className="text-sm text-muted-foreground">United States</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+13024153171" className="text-sm text-primary hover:underline">
                    +1 302 415 3171
                  </a>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:hello@techsci.io" className="text-sm text-primary hover:underline">
                    hello@techsci.io
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm">What are your support hours?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We respond to inquiries Monday-Friday, 9 AM - 6 PM EST. Emergency support available 24/7 for Enterprise customers.
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-sm">How quickly will you respond?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We aim to respond to all inquiries within 24-48 hours. Urgent matters are prioritized.
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-sm">Can I schedule a demo?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Yes! Mention "Demo Request" in your subject line and we'll schedule a personalized demo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Looking for Legal Information?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Find our policies and legal documents:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/privacy">Privacy Policy</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/terms">Terms of Service</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/cookies">Cookie Policy</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LegalLayout>
  );
}
