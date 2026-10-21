import { expect, Page } from "@playwright/test";

export const navigateToAccount = async (
  page: Page,
  account: string | RegExp
): Promise<void> => {
  await page.getByRole("link", { name: account }).click();
  expect(page.getByRole("heading", { name: account })).toBeVisible();
};
