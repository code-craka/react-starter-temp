import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, logAuth, logSubscription, logQuota } from "~/lib/logger";

describe("Logger Utility", () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("logger", () => {
    it("should have info method", () => {
      expect(logger.info).toBeDefined();
      expect(typeof logger.info).toBe("function");
    });

    it("should have error method", () => {
      expect(logger.error).toBeDefined();
      expect(typeof logger.error).toBe("function");
    });

    it("should have warn method", () => {
      expect(logger.warn).toBeDefined();
      expect(typeof logger.warn).toBe("function");
    });
  });

  describe("logAuth", () => {
    it("should log successful authentication", () => {
      const infoSpy = vi.spyOn(logger, "info");
      logAuth.success("user123", "test@techsci.io", { method: "oauth" });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "auth_success",
          userId: "user123",
          email: "test@techsci.io",
          method: "oauth",
        }),
        "User authenticated successfully"
      );
    });

    it("should log failed authentication", () => {
      const warnSpy = vi.spyOn(logger, "warn");
      logAuth.failure("test@techsci.io", "invalid_password");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "auth_failure",
          email: "test@techsci.io",
          reason: "invalid_password",
        }),
        "Authentication failed"
      );
    });

    it("should log logout", () => {
      const infoSpy = vi.spyOn(logger, "info");
      logAuth.logout("user123");

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "auth_logout",
          userId: "user123",
        }),
        "User logged out"
      );
    });
  });

  describe("logSubscription", () => {
    it("should log subscription creation", () => {
      const infoSpy = vi.spyOn(logger, "info");
      logSubscription.created("sub_123", "pro", 29.99);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "subscription_created",
          subscriptionId: "sub_123",
          plan: "pro",
          amount: 29.99,
        }),
        "Subscription created"
      );
    });

    it("should log subscription update", () => {
      const infoSpy = vi.spyOn(logger, "info");
      logSubscription.updated("sub_123", "free", "pro");

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "subscription_updated",
          subscriptionId: "sub_123",
          oldPlan: "free",
          newPlan: "pro",
        }),
        "Subscription updated"
      );
    });

    it("should log subscription cancellation", () => {
      const infoSpy = vi.spyOn(logger, "info");
      logSubscription.canceled("sub_123", "pro");

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "subscription_canceled",
          subscriptionId: "sub_123",
          plan: "pro",
        }),
        "Subscription canceled"
      );
    });

    it("should log payment failure", () => {
      const errorSpy = vi.spyOn(logger, "error");
      logSubscription.paymentFailed("sub_123", 29.99, "card_declined");

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "subscription_payment_failed",
          subscriptionId: "sub_123",
          amount: 29.99,
          reason: "card_declined",
        }),
        "Subscription payment failed"
      );
    });
  });

  describe("logQuota", () => {
    it("should log quota breach", () => {
      const warnSpy = vi.spyOn(logger, "warn");
      logQuota.breached("org_123", "ai_messages", 105, 100);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "quota_breached",
          orgId: "org_123",
          metricType: "ai_messages",
          usage: 105,
          limit: 100,
          percentUsed: 105,
        }),
        "Quota breached"
      );
    });

    it("should log quota warning", () => {
      const warnSpy = vi.spyOn(logger, "warn");
      logQuota.warning("org_123", "ai_messages", 92, 100);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "quota_warning",
          orgId: "org_123",
          metricType: "ai_messages",
          usage: 92,
          limit: 100,
          percentUsed: 92,
        }),
        "Quota warning - approaching limit"
      );
    });
  });
});
