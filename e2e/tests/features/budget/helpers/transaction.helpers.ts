import { expect, Page } from "@playwright/test";

export const expectTransactionCategoryVisible = async (
  page: Page,
  categoryGroup: string,
  category: string
): Promise<void> => {
  const row = page.getByRole("row").filter({
    hasText: `${categoryGroup} : ${category}`,
  });

  await expect(row).toBeVisible();
};
