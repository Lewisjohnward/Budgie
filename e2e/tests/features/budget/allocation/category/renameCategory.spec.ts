import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import {
  expectCategoryMissing,
  expectCategoryVisible,
  renameCategory,
} from "../../helpers/category.helpers";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import { expectTransactionCategoryVisible } from "../../helpers/transaction.helpers";

test.describe("category", () => {
  test.describe("rename", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can rename category", async ({ page, request }) => {
      await setupScenario(page, request, "rename-category-group");

      await renameCategory(page, "Groceries", "Transport");
      await expectCategoryMissing(page, "Groceries");
      await expectCategoryVisible(page, "Transport");

      await navigateToAccount(page, /test account/i);

      await page.reload();

      await expectTransactionCategoryVisible(page, "Important", "Transport");
    });
  });
});
