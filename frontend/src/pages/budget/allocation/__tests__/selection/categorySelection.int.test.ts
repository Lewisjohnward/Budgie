import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { setupTestServer } from "../__helpers__/msw/server";
import { setSnapshot } from "../__helpers__/msw/state";
import { renderAllocationPage } from "../__helpers__/testUtils";
import { getUser, setupUser } from "../helpers/user";
import {
  assertCategoryNotSelected,
  assertCategorySelected,
  assertEditCategoryButtonVisible,
  assertNoCategoriesSelected,
  assertNoEditCategoryButtons,
  assertSelectedCategoryCount,
  assertSelectedCategoriesContain,
  assertSelectedCategoriesNotContain,
  getCategoryCheckbox,
  getCategoryContextMenu,
  getCategoryGroupCheckbox,
  getEditCategoryButton,
  selectCategories,
  selectCategory,
  selectCategoryGroup,
} from "../helpers/allocation.helpers";
import { snapshot } from "./categorySelection.snapshot";

setupTestServer();

const setupSelectionTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  renderAllocationPage();
  setupUser();
};

describe("selection", () => {
  beforeEach(() => {
    setupSelectionTest(snapshot);
  });

  describe("default", () => {
    it("does not display selected categories when none are selected", async () => {
      await getCategoryGroupCheckbox("Important");

      assertNoCategoriesSelected();
    });
  });

  describe("category group", () => {
    it("checking checkbox selects all categories owned by category group", async () => {
      await selectCategoryGroup("Important");

      expect(await getCategoryGroupCheckbox("Important")).toBeChecked();

      assertCategorySelected("Groceries");
      assertCategorySelected("Rent");
      assertSelectedCategoryCount(2);
      assertSelectedCategoriesContain("Groceries", "Rent");
    });

    it("unchecking category group deselects all categories owned by category group", async () => {
      const checkbox = await getCategoryGroupCheckbox("Important");

      await getUser().click(checkbox);

      expect(checkbox).toBeChecked();
      assertCategorySelected("Groceries");
      assertCategorySelected("Rent");

      await getUser().click(checkbox);

      expect(checkbox).not.toBeChecked();
      assertCategoryNotSelected("Groceries");
      assertCategoryNotSelected("Rent");
      assertNoCategoriesSelected();
    });
  });

  describe("category", () => {
    it("checking category checkbox selects the category", async () => {
      await selectCategory("Groceries");

      assertCategorySelected("Groceries");
      assertCategoryNotSelected("Rent");
      assertSelectedCategoriesContain("Groceries");
      assertEditCategoryButtonVisible("Groceries");
    });

    it("checking multiple checkboxes selects multiple categories", async () => {
      await selectCategories("Groceries", "Rent");

      assertCategorySelected("Groceries");
      assertCategorySelected("Rent");
      assertSelectedCategoryCount(2);
      assertSelectedCategoriesContain("Groceries", "Rent");
      assertNoEditCategoryButtons();
    });

    it("unchecking checkbox deselects the category", async () => {
      const checkbox = await getCategoryCheckbox("Groceries");

      await getUser().click(checkbox);
      expect(checkbox).toBeChecked();

      await getUser().click(checkbox);

      expect(checkbox).not.toBeChecked();
      assertNoCategoriesSelected();
    });

    it("unchecking one category leaves the other category selected", async () => {
      await selectCategories("Groceries", "Rent");

      await getUser().click(await getCategoryCheckbox("Groceries"));

      assertCategoryNotSelected("Groceries");
      assertCategorySelected("Rent");
      assertSelectedCategoriesContain("Rent");
      assertSelectedCategoriesNotContain("Groceries");
    });

    it("does not display edit button when uncategorised is selected", async () => {
      await selectCategory("Uncategorised");

      assertCategorySelected("Uncategorised");
      assertSelectedCategoriesContain("Uncategorised");
      assertNoEditCategoryButtons();
    });

    it("opens the category context menu when edit is clicked", async () => {
      await selectCategory("Groceries");

      await getUser().click(getEditCategoryButton("Groceries"));

      expect(await getCategoryContextMenu("Groceries")).toBeInTheDocument();
    });
  });
});
