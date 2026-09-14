import { test, expect } from "@playwright/test";
import { resetDatabase } from "../../helpers/setup";
import { seed } from "../../helpers/seed";

test.describe("Demo mode", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });
  test("should allow a user to enter the demo", async ({ page, request }) => {
    await seed(request, "demo");

    await page.goto("/user/login");

    await expect(
      page.getByRole("heading", { name: /try budgie/i })
    ).toBeVisible();

    const demoButton = page.getByRole("button", {
      name: /try the demo/i,
    });

    await expect(demoButton).toBeVisible();

    await demoButton.click();

    await expect(page).toHaveURL(/\/budget\/allocation/);

    await expect(page.getByText("Santander")).toBeVisible();
  });
});
