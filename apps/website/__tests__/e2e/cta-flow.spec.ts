import { test, expect } from "@playwright/test";

test.describe("Signup CTA Flow", () => {
  test("should have CTA button in hero section", async ({ page }) => {
    await page.goto("/");

    // Check hero CTA exists and is visible - Hero uses "Get Started Free"
    const heroCta = page.getByRole("link", { name: /Get Started Free/i }).first();
    await expect(heroCta).toBeVisible();
  });

  test("should have CTA buttons in pricing section", async ({ page }) => {
    await page.goto("/pricing");

    // Check Free plan CTA on pricing page
    const freeCtaButton = page.getByRole("link", { name: /Get Started Free/i }).first();
    await expect(freeCtaButton).toBeVisible();
  });

  test("should have final CTA section on homepage", async ({ page }) => {
    await page.goto("/");

    // Scroll to final CTA section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
    await page.waitForTimeout(500);

    // Check for CTA text
    await expect(page.getByText(/Ready to/i)).toBeVisible();
  });

  test("should have CTA in header", async ({ page }) => {
    await page.goto("/");

    // Desktop header should have Get Started Free button
    const headerCta = page.getByRole("link", { name: /Get Started Free/i }).first();
    await expect(headerCta).toBeVisible();
  });
});
