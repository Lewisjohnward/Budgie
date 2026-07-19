import { Page } from "@playwright/test";

export const navigateToAccount = async (
  page: Page,
  account: string | RegExp
): Promise<void> => {
  await page.getByText(account).click();
};
