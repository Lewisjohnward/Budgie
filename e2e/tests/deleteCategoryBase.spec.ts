import { test, expect } from "@playwright/test";
import { resetDatabase } from "../helpers/setup";
import { login, RegisterPayload } from "../helpers/auth";
import { seedScenario } from "../helpers/seed";

test.beforeEach(async () => {
  await resetDatabase();
});

test("user can delete a category", async ({ page, request }) => {
  const credentials = await seedScenario(request, "delete-category-base");

  await login(page, credentials as RegisterPayload);

  await page.goto("/budget/allocation");

  await expect(page.getByText("Groceries")).toBeVisible();

  await page.getByText("Groceries").click({
    button: "right",
  });

  await page.getByRole("button", { name: /delete/i }).click();

  await expect(page.getByText("Groceries")).toHaveCount(0);
});
