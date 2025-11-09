import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Taskcoda/i);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");

    // Check for hero section content
    await expect(page.getByRole("heading", { name: /Taskcoda/i })).toBeVisible();
    await expect(page.getByText(/Modern task management/i)).toBeVisible();
  });

  test("should have navigation menu", async ({ page }) => {
    await page.goto("/");

    // Check for navigation links
    await expect(page.getByRole("link", { name: /Features/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Pricing/i })).toBeVisible();
  });

  test("should navigate to pricing page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByText(/Choose Your Plan/i)).toBeVisible();
  });

  test("should display pricing plans", async ({ page }) => {
    await page.goto("/pricing");

    // Check for pricing plans
    await expect(page.getByText(/Free/i)).toBeVisible();
    await expect(page.getByText(/Pro/i)).toBeVisible();
    await expect(page.getByText(/Enterprise/i)).toBeVisible();
  });

  test("should navigate to contact page", async ({ page }) => {
    await page.goto("/");

    // Find and click contact link in footer
    await page.getByRole("link", { name: /Contact/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByText(/Contact Us/i)).toBeVisible();
  });

  test("should display contact form", async ({ page }) => {
    await page.goto("/contact");

    // Check for form elements
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Subject/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Send Message/i })).toBeVisible();
  });

  test("should navigate to legal pages", async ({ page }) => {
    await page.goto("/");

    // Privacy Policy
    await page.getByRole("link", { name: /Privacy/i }).first().click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByText(/Privacy Policy/i)).toBeVisible();

    // Navigate back
    await page.goto("/");

    // Terms of Service
    await page.getByRole("link", { name: /Terms/i }).first().click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.getByText(/Terms of Service/i)).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Taskcoda/i })).toBeVisible();
  });

  test("should have correct meta tags", async ({ page }) => {
    await page.goto("/");

    // Check meta tags
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description).toContain("task");
  });
});
