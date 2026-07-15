import test, { expect } from "@playwright/test";
import { resetDatabase } from "../../helpers/setup";

test.beforeEach(async () => {
  await resetDatabase();
});

test("login page loads", async ({ page }) => {
  await page.goto("/user/login");

  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
});
