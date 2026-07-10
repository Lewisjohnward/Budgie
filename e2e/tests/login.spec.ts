import { test, expect } from "@playwright/test";
import { seedScenario } from "../helpers/seed";
import { resetDatabase } from "../helpers/setup";

test.beforeEach(async () => {
  await resetDatabase();
});

test("user can login", async ({ page, request }) => {
  const credentials = await seedScenario(request, "login");

  await page.goto("/user/login");

  await page.getByRole("textbox", { name: /email/i }).fill(credentials.email);

  await page
    .getByRole("textbox", { name: /password/i })
    .fill(credentials.password);

  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page).toHaveURL(/budget/, {
    timeout: 10000,
  });
});
