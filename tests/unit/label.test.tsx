import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "~/components/ui/label";

describe("Label Component", () => {
  it("should render label with text", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("should apply htmlFor attribute", () => {
    render(<Label htmlFor="email" data-testid="label">Email</Label>);
    expect(screen.getByTestId("label")).toHaveAttribute("for", "email");
  });

  it("should merge custom className", () => {
    render(<Label className="custom-class" data-testid="label">Label</Label>);
    expect(screen.getByTestId("label")).toHaveClass("custom-class");
  });

  it("should apply default styling", () => {
    render(<Label data-testid="label">Label</Label>);
    const label = screen.getByTestId("label");
    expect(label).toHaveClass("text-sm", "font-medium");
  });

  it("should render children elements", () => {
    render(
      <Label>
        <span>Required</span>
        <span className="text-red-500">*</span>
      </Label>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should associate with form input", () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" type="text" />
      </div>
    );
    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "username");
  });
});
