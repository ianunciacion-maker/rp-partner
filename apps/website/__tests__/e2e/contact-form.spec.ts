import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("should display contact form with all fields", async ({ page }) => {
    // Check all form fields are present
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Subject")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Message" })).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    // Try to submit empty form
    await page.getByRole("button", { name: "Send Message" }).click();

    // Check for validation error messages
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
    await expect(page.getByText("Message must be at least 10 characters")).toBeVisible();
  });

  test("should require valid email format", async ({ page }) => {
    // The email input has type="email" which provides native browser validation
    // React Hook Form + Zod adds additional validation on submission
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("should submit form successfully with valid data", async ({ page }) => {
    // Fill in the form with valid data
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByLabel("Subject").selectOption("general");
    await page.getByLabel("Message").fill("This is a test message for the contact form submission.");

    // Submit the form
    await page.getByRole("button", { name: "Send Message" }).click();

    // Wait for success message
    await expect(page.getByText("Message Sent!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Thank you for reaching out")).toBeVisible();
  });

  test("should allow sending another message after success", async ({
    page,
  }) => {
    // Submit a valid form
    await page.getByLabel("Name").fill("Jane Doe");
    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Subject").selectOption("support");
    await page.getByLabel("Message").fill("Testing the contact form functionality.");

    await page.getByRole("button", { name: "Send Message" }).click();

    // Wait for success and click send another
    await expect(page.getByText("Message Sent!")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Send Another Message" }).click();

    // Form should be visible again
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("");
  });

  test("should have all subject options", async ({ page }) => {
    const select = page.getByLabel("Subject");

    // Check that select has options
    await expect(select.locator('option[value="general"]')).toHaveText("General Inquiry");
    await expect(select.locator('option[value="support"]')).toHaveText("Support");
    await expect(select.locator('option[value="partnership"]')).toHaveText("Partnership");
    await expect(select.locator('option[value="press"]')).toHaveText("Press");
  });
});
