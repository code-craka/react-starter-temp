import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "~/components/ui/card";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render card component", () => {
      render(<Card data-testid="card">Card content</Card>);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-xl", "border", "bg-card");
    });

    it("should merge custom className", () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      expect(screen.getByTestId("card")).toHaveClass("custom-class");
    });
  });

  describe("CardHeader", () => {
    it("should render card header", () => {
      render(
        <Card>
          <CardHeader data-testid="card-header">Header</CardHeader>
        </Card>
      );
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <Card>
          <CardHeader data-testid="card-header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByTestId("card-header");
      expect(header).toHaveClass("grid");
    });
  });

  describe("CardTitle", () => {
    it("should render card title", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle data-testid="card-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );
      const title = screen.getByTestId("card-title");
      expect(title).toHaveClass("font-semibold", "leading-none");
    });
  });

  describe("CardDescription", () => {
    it("should render card description", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription data-testid="card-desc">Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByTestId("card-desc")).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("CardContent", () => {
    it("should render card content", () => {
      render(
        <Card>
          <CardContent data-testid="card-content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <Card>
          <CardContent data-testid="card-content">Content</CardContent>
        </Card>
      );
      expect(screen.getByTestId("card-content")).toHaveClass("px-6");
    });
  });

  describe("CardFooter", () => {
    it("should render card footer", () => {
      render(
        <Card>
          <CardFooter data-testid="card-footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId("card-footer")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <Card>
          <CardFooter data-testid="card-footer">Footer</CardFooter>
        </Card>
      );
      expect(screen.getByTestId("card-footer")).toHaveClass("flex", "items-center");
    });
  });

  describe("Card Composition", () => {
    it("should render complete card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Content goes here")).toBeInTheDocument();
      expect(screen.getByText("Footer actions")).toBeInTheDocument();
    });
  });
});
