import { type Page } from "@playwright/test";

export const navigateToPreviousMonth = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "previous month" }).click();
};

export const navigateToNextMonth = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "previous month" }).click();
};
