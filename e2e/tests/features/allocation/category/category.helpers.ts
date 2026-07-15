import { expect, type Locator, type Page } from "@playwright/test";

export const getCategoryRow = (page: Page, name: string): Locator =>
  page.getByRole("row", { name: `${name} category` });

export const openCategoryContextMenu = async (
  page: Page,
  name: string
): Promise<void> => {
  await page.getByText(name).click({
    button: "right",
  });
};

export const expectCategoryPresent = async (
  page: Page,
  name: string
): Promise<void> => {
  await expect(page.getByText(name)).toBeVisible();
};

export const expectCategoryMissing = async (
  page: Page,
  name: string
): Promise<void> => {
  await expect(page.getByText(name)).toHaveCount(0);
};

export const selectCategoryToReceiveTransactions = async (
  page: Page,
  name: string
): Promise<void> => {
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill(name);
  await expect(page.getByRole("option", { name })).toBeVisible();

  await page.getByRole("option", { name }).click();
};

export const expectCategoryAmounts = async (
  page: Page,
  category: string,
  amounts: {
    activity?: string | RegExp;
    available?: string | RegExp;
  }
): Promise<void> => {
  const row = page.getByRole("row", { name: `${category} category` });

  if (amounts.activity) {
    await expect(row.getByRole("gridcell", { name: "activity" })).toHaveText(
      amounts.activity
    );
  }

  if (amounts.available) {
    await expect(row.getByRole("gridcell", { name: "available" })).toHaveText(
      amounts.available
    );
  }
};
