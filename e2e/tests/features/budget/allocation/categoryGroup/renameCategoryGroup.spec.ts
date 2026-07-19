import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup.ts";
import {
  expectCategoryGroupMissing,
  expectCategoryGroupVisible,
  renameCategoryGroup,
} from "../../helpers/categoryGroup.helpers.ts";
import { navigateToAccount } from "../../helpers/navigation.helpers.ts";
import { expectTransactionCategoryVisible } from "../../helpers/transaction.helpers.ts";

test.describe("category group", () => {
  test.describe("rename", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can rename category group", async ({ page, request }) => {
      await setupScenario(page, request, "rename-category-group");

      await renameCategoryGroup(page, "Important", "Essentials");

      await expectCategoryGroupMissing(page, "Important");
      await expectCategoryGroupVisible(page, "Essentials");

      await navigateToAccount(page, /test account/i);

      await page.reload();

      await expectTransactionCategoryVisible(page, "Essentials", "Groceries");
    });
  });
});
