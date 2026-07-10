import { expect, Page } from "@playwright/test";

export type RegisterPayload = {
  email: string;
  password: string;
};

export async function login(page: Page, credentials: RegisterPayload) {
  await page.goto("/user/login");

  await page.getByRole("textbox", { name: /email/i }).fill(credentials.email);

  await page
    .getByRole("textbox", { name: /password/i })
    .fill(credentials.password);

  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page).toHaveURL(/budget/);
}
