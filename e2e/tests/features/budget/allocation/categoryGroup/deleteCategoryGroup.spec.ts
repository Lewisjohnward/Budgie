import { expect, test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import {
  confirmDelete,
  expectCategoryMissing,
  cancelDelete,
  expectCategoryVisible,
  selectCategoryToReceiveTransactions,
  expectCategoryAmounts,
} from "../../helpers/category.helpers";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import { expectTransactionCategoryVisible } from "../../helpers/transaction.helpers";
import {
  deleteCategoryGroup,
  expectCategoryGroupMissing,
  expectCategoryGroupVisible,
} from "../../helpers/categoryGroup.helpers";

test.describe("category group", () => {
  test.describe("delete", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can delete empty category group", async ({ page, request }) => {
      await setupScenario(page, request, "delete-category-group-base");

      await deleteCategoryGroup(page, "Important");

      await expectCategoryGroupMissing(page, "Important");
    });

    test("can delete category group containing assigned money", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "delete-category-group-with-assigned");

      await deleteCategoryGroup(page, "Important");

      await confirmDelete(page);

      await expectCategoryGroupMissing(page, "Important");
      await expectCategoryMissing(page, "Groceries");

      await expect(page.getByText(/all money assigned/i)).toBeVisible();
    });

    test("can cancel deleting category group", async ({ page, request }) => {
      await setupScenario(page, request, "delete-category-group-with-assigned");

      await deleteCategoryGroup(page, "Important");

      await cancelDelete(page);

      await expectCategoryGroupVisible(page, "Important");
      await expectCategoryVisible(page, "Groceries");
    });

    test("can delete category group with transactions", async ({
      page,
      request,
    }) => {
      await setupScenario(
        page,
        request,
        "delete-category-group-with-transaction"
      );

      await deleteCategoryGroup(page, "Important");

      await selectCategoryToReceiveTransactions(page, "Unplanned");

      await confirmDelete(page);

      await expectCategoryGroupMissing(page, "Important");
      await expectCategoryMissing(page, "Groceries");

      await expectCategoryAmounts(page, "Unplanned", {
        activity: /-£10.00/i,
        available: /-£10.00/i,
      });

      await navigateToAccount(page, /test account/i);

      await page.reload();

      await expectTransactionCategoryVisible(
        page,
        "Entertainment",
        "Unplanned"
      );
    });
  });
});
