import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import {
  expectGroupCategories,
  dragCategory,
  dragCategoryToEnd,
  dragCategoryOutside,
  dragCategoryToGroup,
  collapseCategoryGroup,
  expandCategoryGroup,
} from "../../helpers/allocation.helpers";

test.describe("category", () => {
  test.describe("reorder", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can reorder categories within a group", async ({ page, request }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);

      await dragCategory(page, "Gym", "Groceries");

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Groceries",
        "Phone",
      ]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Groceries",
        "Phone",
      ]);
    });

    test("can reorder a category across groups", async ({ page, request }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent"]);

      await dragCategory(page, "Gym", "Broadband");

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Gym", "Rent"]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Gym", "Rent"]);
    });

    test("can reorder a category to the end of a group", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category-within-group");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Broadband",
      ]);

      await dragCategoryToEnd(page, "Groceries", "Everyday");

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Broadband",
        "Groceries",
      ]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Broadband",
        "Groceries",
      ]);
    });

    test("does not reorder a category when dragged outside the viewport", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);

      await dragCategoryOutside(page, "Gym", "Groceries");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);
    });

    test("can reorder a category into an empty group", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);
      await expectGroupCategories(page, "Empty", []);

      await dragCategoryToGroup(page, "Gym", "Empty");

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Empty", ["Gym"]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Empty", ["Gym"]);
    });

    test("can reorder a category into a closed group", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent"]);
      await collapseCategoryGroup(page, "Bills");

      await dragCategoryToGroup(page, "Gym", "Bills");

      await expandCategoryGroup(page, "Bills");

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent", "Gym"]);

      await page.reload();

      await expectGroupCategories(page, "Everyday", ["Groceries", "Phone"]);
      await expectGroupCategories(page, "Bills", ["Broadband", "Rent", "Gym"]);
    });

    test("persists reordering when navigating to and from another page", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "reorder-category");

      await expectGroupCategories(page, "Everyday", [
        "Groceries",
        "Gym",
        "Phone",
      ]);

      await dragCategory(page, "Gym", "Groceries");

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Groceries",
        "Phone",
      ]);

      await page.getByRole("link", { name: "All Accounts" }).click();

      await page.getByRole("link", { name: "Budget" }).click();

      await expectGroupCategories(page, "Everyday", [
        "Gym",
        "Groceries",
        "Phone",
      ]);
    });
  });
});
