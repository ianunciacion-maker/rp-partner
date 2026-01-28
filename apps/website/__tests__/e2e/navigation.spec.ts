import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to Features page from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Features" }).click();
    await page.waitForURL("/features");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate to Pricing page from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Pricing" }).click();
    await page.waitForURL("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate to About page from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "About" }).click();
    await page.waitForURL("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate to Contact page from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Contact" }).click();
    await page.waitForURL("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should navigate home via logo", async ({ page }) => {
    await page.goto("/features");
    await page.getByRole("link", { name: "RP-Partner" }).first().click();
    await page.waitForURL("/");
  });

  test("should navigate to legal pages from footer", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer and wait
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Navigate to Privacy using footer-scoped link
    await footer.getByRole("link", { name: "Privacy Policy" }).click();
    await page.waitForURL("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy");

    // Navigate to Terms
    await page.goto("/");
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByRole("contentinfo").getByRole("link", { name: "Terms of Service" }).click();
    await page.waitForURL("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms");
  });

  test("should show 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/non-existent-page");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Page Not Found")).toBeVisible();
  });

  test("should have working back to home button on 404 page", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Wait for page to fully load
    await expect(page.getByText("404")).toBeVisible();

    // Click the Back to Home link
    await page.getByRole("link", { name: /Back to Home/i }).click();

    // Wait for navigation
    await page.waitForURL("/");
  });
});
