import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "~/components/ui/textarea";

describe("Textarea Component", () => {
  it("should render textarea element", () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  it("should render with placeholder text", () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument();
  });

  it("should handle text input", async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Hello World");

    expect(textarea).toHaveValue("Hello World");
  });

  it("should call onChange handler", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Textarea onChange={handleChange} data-testid="textarea" />);
    await user.type(screen.getByTestId("textarea"), "test");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toBeDisabled();
  });

  it("should not accept input when disabled", async () => {
    const user = userEvent.setup();
    render(<Textarea disabled data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "test");

    expect(textarea).toHaveValue("");
  });

  it("should render with default value", () => {
    render(<Textarea defaultValue="default text" data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveValue("default text");
  });

  it("should render as controlled component", () => {
    const { rerender } = render(<Textarea value="" onChange={vi.fn()} data-testid="textarea" />);

    expect(screen.getByTestId("textarea")).toHaveValue("");

    rerender(<Textarea value="controlled" onChange={vi.fn()} data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveValue("controlled");
  });

  it("should apply custom className", () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveClass("custom-class");
  });

  it("should apply default styling", () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("flex", "w-full", "rounded-md", "border");
  });

  it("should handle required attribute", () => {
    render(<Textarea required data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toBeRequired();
  });

  it("should handle maxLength attribute", () => {
    render(<Textarea maxLength={100} data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute("maxLength", "100");
  });

  it("should handle readOnly attribute", () => {
    render(<Textarea readOnly value="readonly text" onChange={vi.fn()} data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute("readOnly");
  });

  it("should handle rows attribute", () => {
    render(<Textarea rows={10} data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute("rows", "10");
  });

  it("should handle name attribute", () => {
    render(<Textarea name="message" data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute("name", "message");
  });

  it("should handle multiline text", async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    await user.type(textarea, "Line 1{Enter}Line 2{Enter}Line 3");

    expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
  });
});
