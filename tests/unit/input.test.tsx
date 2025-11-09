import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "~/components/ui/input";

describe("Input Component", () => {
  it("should render input element", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("should render with placeholder text", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("should handle text input", async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("should call onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} data-testid="input" />);
    await user.type(screen.getByTestId("input"), "test");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("should not accept input when disabled", async () => {
    const user = userEvent.setup();
    render(<Input disabled data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.type(input, "test");

    expect(input).toHaveValue("");
  });

  it("should render with type attribute", () => {
    render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });

  it("should render password input", () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");
  });

  it("should render number input", () => {
    render(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
  });

  it("should render with default value", () => {
    render(<Input defaultValue="default text" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveValue("default text");
  });

  it("should render as controlled component", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Input value="" onChange={vi.fn()} data-testid="input" />);

    expect(screen.getByTestId("input")).toHaveValue("");

    rerender(<Input value="controlled" onChange={vi.fn()} data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveValue("controlled");
  });

  it("should apply custom className", () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("custom-class");
  });

  it("should apply default styling", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input).toHaveClass("flex", "h-9", "w-full", "rounded-md", "border");
  });

  it("should handle required attribute", () => {
    render(<Input required data-testid="input" />);
    expect(screen.getByTestId("input")).toBeRequired();
  });

  it("should handle maxLength attribute", () => {
    render(<Input maxLength={10} data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("maxLength", "10");
  });

  it("should handle readOnly attribute", () => {
    render(<Input readOnly value="readonly text" onChange={vi.fn()} data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("readOnly");
  });

  it("should handle autoFocus attribute", () => {
    render(<Input autoFocus data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveFocus();
  });

  it("should handle name attribute", () => {
    render(<Input name="username" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("name", "username");
  });

  it("should handle id attribute", () => {
    render(<Input id="email-input" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("id", "email-input");
  });
});
