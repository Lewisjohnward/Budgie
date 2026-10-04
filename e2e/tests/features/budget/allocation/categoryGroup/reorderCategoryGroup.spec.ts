import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import {
  dragCategoryGroup,
  dragCategoryGroupOutside,
  expectCategoryGroups,
  expectGroupCategories,
} from "../../helpers/allocation.helpers";

test.describe("category group", () => {
  test.describe("reorder", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can reorder category groups", async ({ page, request }) => {
      await setupScenario(page, request, "reorder-category-groups");

      await expectGroupCategories(page, "Everyday", ["Groceries", "Gym"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent"]);
      await expectCategoryGroups(page, ["Everyday", "Bills"]);

      await dragCategoryGroup(page, "Bills", "Everyday");

      await expectCategoryGroups(page, ["Bills", "Everyday"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent"]);
      await expectGroupCategories(page, "Everyday", ["Groceries", "Gym"]);

      await page.reload();

      await expectCategoryGroups(page, ["Bills", "Everyday"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent"]);
      await expectGroupCategories(page, "Everyday", ["Groceries", "Gym"]);
    });

    test("does not reorder category groups when dragged outside the category container", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category-groups");

      await expectCategoryGroups(page, ["Everyday", "Bills"]);

      await dragCategoryGroupOutside(page, "Bills", "Everyday");

      await expectCategoryGroups(page, ["Everyday", "Bills"]);

      await page.reload();

      await expectCategoryGroups(page, ["Everyday", "Bills"]);
    });
  });
});
