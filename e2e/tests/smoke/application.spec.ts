import { test, expect } from "@playwright/test";
import { resetDatabase } from "../../helpers/setup";

test.beforeEach(async () => {
  await resetDatabase();
});

test("application loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toContainText("Budgie");
});
