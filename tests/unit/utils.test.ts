import { describe, it, expect } from "vitest";
import { cn } from "~/lib/utils";

describe("Utility Functions", () => {
  describe("cn (className merger)", () => {
    it("should merge single className", () => {
      const result = cn("text-red-500");
      expect(result).toBe("text-red-500");
    });

    it("should merge multiple classNames", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle conditional classNames", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base active");
    });

    it("should filter out false values", () => {
      const result = cn("base", false && "hidden", null, undefined);
      expect(result).toBe("base");
    });

    it("should merge Tailwind classes and resolve conflicts", () => {
      const result = cn("p-4 p-2");
      expect(result).toBe("p-2");
    });

    it("should handle arrays of classNames", () => {
      const result = cn(["text-sm", "font-bold"]);
      expect(result).toBe("text-sm font-bold");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle complex conditional logic", () => {
      const variant = "primary";
      const size = "lg";
      const result = cn(
        "button",
        variant === "primary" && "bg-blue-500",
        size === "lg" && "text-lg"
      );
      expect(result).toBe("button bg-blue-500 text-lg");
    });
  });
});
