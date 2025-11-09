import { Link } from "react-router";
import { ChevronRight, ArrowUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useEffect, useState } from "react";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
  breadcrumb?: string;
}

export function LegalLayout({ children, title, lastUpdated, breadcrumb }: LegalLayoutProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Taskcoda</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/privacy" className="text-sm hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="text-sm hover:text-primary transition-colors">
                Cookies
              </Link>
              <Link to="/aup" className="text-sm hover:text-primary transition-colors">
                Acceptable Use
              </Link>
              <Link to="/contact" className="text-sm hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">{breadcrumb || title}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Separator />

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {children}
          </div>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Questions or Concerns?</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this policy, please contact us:
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>TechSci, Inc.</strong>
              </p>
              <p>1111B S Governors Ave STE 34002</p>
              <p>Dover, DE 19904, United States</p>
              <p>
                Email:{" "}
                <a href="mailto:hello@techsci.io" className="text-primary hover:underline">
                  hello@techsci.io
                </a>
              </p>
              <p>Phone: +1 302 415 3171</p>
            </div>
            <Button asChild variant="default" size="sm" className="mt-4">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-40"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          header, .no-print {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
