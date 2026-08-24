import { test, expect } from "@playwright/test";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import {
  cancelDelete,
  confirmDelete,
  deleteCategory,
  expectCategoryAmounts,
  expectCategoryMissing,
  expectCategoryVisible,
  selectCategoryToReceiveTransactions,
} from "../../helpers/category.helpers";

import { expectTransactionCategoryVisible } from "../../helpers/transaction.helpers";

test.describe("category", () => {
  test.describe("delete", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can delete empty category", async ({ page, request }) => {
      await setupScenario(page, request, "delete-category-base");

      await expectCategoryVisible(page, "Groceries");
      await deleteCategory(page, "Groceries");

      await expectCategoryMissing(page, "Groceries");
    });

    test("can delete category with assigned money", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "delete-category-with-assigned");

      await expectCategoryVisible(page, "Groceries");

      await deleteCategory(page, "Groceries");

      await confirmDelete(page);

      await expectCategoryMissing(page, "Groceries");

      await expect(page.getByText(/all money assigned/i)).toBeVisible();
    });

    test("can cancel deleting category group", async ({ page, request }) => {
      await setupScenario(page, request, "delete-category-group-with-assigned");

      await deleteCategory(page, "Groceries");

      await cancelDelete(page);

      await expectCategoryVisible(page, "Groceries");
    });

    test("can delete category with transactions", async ({ page, request }) => {
      await setupScenario(page, request, "delete-category-with-transaction");

      await expectCategoryVisible(page, "Groceries");

      await deleteCategory(page, "Groceries");

      await selectCategoryToReceiveTransactions(page, "Christmas");

      await confirmDelete(page);

      await expectCategoryMissing(page, "Groceries");

      await expectCategoryAmounts(page, "Christmas", {
        activity: /-£10.00/i,
        available: /-£10.00/i,
      });

      await navigateToAccount(page, /test account/i);

      await page.reload();

      await expectTransactionCategoryVisible(page, "Important", "Christmas");
    });
  });
});
