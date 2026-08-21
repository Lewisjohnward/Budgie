import { expect, Page } from "@playwright/test";

const openCategoryGroupContextMenu = async (
  page: Page,
  categoryGroupName: string
): Promise<void> => {
  await page
    .getByRole("row", {
      name: `${categoryGroupName} category group`,
      exact: true,
    })
    .click({
      button: "right",
    });
};

export const deleteCategoryGroup = async (
  page: Page,
  categoryGroupName: string
): Promise<void> => {
  await openCategoryGroupContextMenu(page, categoryGroupName);
  await page.getByRole("button", { name: /delete/i }).click();
};

export const confirmDelete = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: /delete/i }).click();
};

export const cancelDelete = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: /cancel/i }).click();
};

export const expectCategoryGroupVisible = async (
  page: Page,
  categoryGroupName: string
): Promise<void> => {
  const categoryGroupRow = page.getByRole("row", {
    name: `${categoryGroupName} category group`,
  });
  await expect(categoryGroupRow).toBeVisible();
};

export const expectCategoryGroupMissing = async (
  page: Page,
  categoryGroupName: string
): Promise<void> => {
  const categoryGroupRow = page.getByRole("row", {
    name: `${categoryGroupName} category group`,
    exact: true,
  });

  await expect(categoryGroupRow).toHaveCount(0);
};

//-----
// rename category group
//-----
export const renameCategoryGroup = async (
  page: Page,
  categoryGroupName: string,
  newCategoryGroupName: string
): Promise<void> => {
  await openCategoryGroupContextMenu(page, categoryGroupName);
  await page
    .getByPlaceholder("Rename category group")
    .fill(newCategoryGroupName);
  await page.getByRole("button", { name: /ok/i }).click();
};
