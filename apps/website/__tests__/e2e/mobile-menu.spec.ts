import { test, expect } from "@playwright/test";

test.describe("Mobile Menu", () => {
  // Use mobile viewport for these tests
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show mobile menu button on small screens", async ({ page }) => {
    await page.goto("/");

    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: /open menu/i });
    await expect(menuButton).toBeVisible();
  });

  test("should open mobile menu and show navigation links", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /open menu/i });

    // Open menu
    await menuButton.click();

    // Mobile menu should be visible with navigation links
    // Use exact: false to match partial text and get any matching element
    await expect(page.getByRole("link", { name: "Features" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "About" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact" }).first()).toBeVisible();
  });

  test("should navigate via mobile menu", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /open menu/i });

    // Open menu
    await menuButton.click();

    // Click Features link (get the first one visible in mobile menu)
    await page.getByRole("link", { name: "Features" }).first().click();

    // Should navigate
    await page.waitForURL("/features");
  });

  test("should close mobile menu", async ({ page }) => {
    await page.goto("/");

    // Open menu
    await page.getByRole("button", { name: /open menu/i }).click();

    // Menu should be open - close button visible
    const closeButton = page.getByRole("button", { name: /close menu/i });
    await expect(closeButton).toBeVisible();

    // Close menu
    await closeButton.click();

    // After closing, open button should be visible again
    await expect(page.getByRole("button", { name: /open menu/i })).toBeVisible();
  });
});

test.describe("Responsive Layout", () => {
  test("should hide mobile menu on desktop", async ({ page }) => {
    // Use desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Mobile menu button should be hidden
    const menuButton = page.getByRole("button", { name: /open menu/i });
    await expect(menuButton).not.toBeVisible();

    // Desktop nav should be visible
    await expect(page.getByRole("navigation").getByRole("link", { name: "Features" })).toBeVisible();
  });

  test("should show mobile menu on tablet", async ({ page }) => {
    // Use tablet viewport below md breakpoint
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /open menu/i });
    await expect(menuButton).toBeVisible();
  });
});
