import { expect, type Locator, type Page } from "@playwright/test";

export const getCategoryRow = (page: Page, name: string): Locator =>
  page.getByRole("row", { name: `${name} category` });

const openCategoryContextMenu = async (
  page: Page,
  categoryName: string
): Promise<void> => {
  await page
    .getByRole("row", {
      name: `${categoryName} category`,
      exact: true,
    })
    .click({
      button: "right",
    });
};

export const deleteCategory = async (
  page: Page,
  categoryName: string
): Promise<void> => {
  await openCategoryContextMenu(page, categoryName);

  await page.getByRole("button", { name: /delete/i }).click();
};

export const confirmDelete = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: /delete/i }).click();
};

export const cancelDelete = async (page: Page): Promise<void> => {
  page.pause();
  await page.getByRole("button", { name: /cancel/i }).click();
};

export const expectCategoryVisible = async (
  page: Page,
  categoryName: string
): Promise<void> => {
  const categoryRow = page.getByRole("row", {
    name: `${categoryName} category`,
    exact: true,
  });
  await expect(categoryRow).toBeVisible();
};

export const expectCategoryMissing = async (
  page: Page,
  categoryName: string
): Promise<void> => {
  const categoryRow = page.getByRole("row", {
    name: `${categoryName} category`,
    exact: true,
  });
  await expect(categoryRow).toHaveCount(0);
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
  categoryName: string,
  amounts: {
    activity?: string | RegExp;
    available?: string | RegExp;
  }
): Promise<void> => {
  const row = page.getByRole("row", { name: `${categoryName} category` });

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

//-----
// rename category
//-----
export const renameCategory = async (
  page: Page,
  categoryName: string,
  newCategoryName: string
): Promise<void> => {
  await openCategoryContextMenu(page, categoryName);
  await page.getByPlaceholder("New category name").fill(newCategoryName);
  await page.getByRole("button", { name: /ok/i }).click();
};
