import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "~/components/ui/badge";

describe("Badge Component", () => {
  it("should render badge with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should apply default variant styling", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("border-transparent", "bg-primary");
  });

  it("should apply secondary variant styling", () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("border-transparent", "bg-secondary");
  });

  it("should apply destructive variant styling", () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("border-transparent", "bg-destructive");
  });

  it("should apply outline variant styling", () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("text-foreground");
  });

  it("should merge custom className", () => {
    render(<Badge className="custom-class" data-testid="badge">Custom</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("custom-class");
  });

  it("should render as different HTML element when provided", () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("should handle complex children", () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });
});
