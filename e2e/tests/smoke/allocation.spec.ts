import test, { expect } from "@playwright/test";
import { login, type RegisterPayload } from "../../helpers/auth";
import { seedScenario } from "../../helpers/seed";
import { resetDatabase } from "../../helpers/setup";

test.beforeEach(async () => {
  await resetDatabase();
});

test("allocation page loads for authenticated user", async ({
  page,
  request,
}) => {
  const credentials = await seedScenario(request, "login");

  await login(page, credentials as RegisterPayload);

  await page.goto("/budget/allocation");

  await expect(
    page.getByRole("button", { name: "budget e2e@test.com" })
  ).toBeVisible();
});
