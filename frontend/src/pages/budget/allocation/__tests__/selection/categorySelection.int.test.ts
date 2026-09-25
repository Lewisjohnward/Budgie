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
  getSelectAllCheckbox,
  selectCategories,
  selectCategory,
  selectCategoryGroup,
  getAssignedAmountInput,
  getCategoryRow,
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

    it("checking an empty category group selects the category group", async () => {
      await selectCategoryGroup("Empty");

      expect(await getCategoryGroupCheckbox("Empty")).toBeChecked();
    });

    it("unchecking an empty category group deselects the category group", async () => {
      const checkbox = await getCategoryGroupCheckbox("Empty");

      await getUser().click(checkbox);
      expect(checkbox).toBeChecked();

      await getUser().click(checkbox);

      expect(checkbox).not.toBeChecked();
      assertNoCategoriesSelected();
    });

    it("shows a partial state when one category in the group is deselected", async () => {
      await selectCategoryGroup("Important");

      await getUser().click(await getCategoryCheckbox("Groceries"));

      expect(await getCategoryGroupCheckbox("Important")).toHaveAttribute(
        "data-state",
        "indeterminate"
      );

      assertCategoryNotSelected("Groceries");
      assertCategorySelected("Rent");
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

  describe("select all", () => {
    it("selects all categories and empty category groups", async () => {
      const checkbox = await getSelectAllCheckbox();

      await getUser().click(checkbox);

      expect(checkbox).toBeChecked();

      assertCategorySelected("Groceries");
      assertCategorySelected("Rent");
      assertCategorySelected("Uncategorised");
      assertSelectedCategoryCount(2);
    });

    it("clears all categories and empty category groups when checked again", async () => {
      const checkbox = await getSelectAllCheckbox();

      await getUser().click(checkbox);
      expect(checkbox).toBeChecked();

      await getUser().click(checkbox);

      expect(checkbox).not.toBeChecked();
      assertNoCategoriesSelected();
    });

    it("shows a partial state when only an empty category group is selected", async () => {
      await selectCategoryGroup("Empty");

      const checkbox = await getSelectAllCheckbox();

      expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    });
  });

  describe("focus", () => {
    it("focuses the assigned field when clicking a category row", async () => {
      const user = getUser();

      const groceriesInput = await getAssignedAmountInput("Groceries");
      const rentInput = await getAssignedAmountInput("Rent");

      await user.click(await getCategoryRow("Groceries"));
      expect(groceriesInput).toHaveFocus();

      await user.click(await getCategoryRow("Rent"));
      expect(rentInput).toHaveFocus();

      await user.click(await getCategoryRow("Groceries"));
      expect(groceriesInput).toHaveFocus();
    });

    it("focuses the assigned field when checking a category checkbox with no selection", async () => {
      const user = getUser();

      const checkbox = await getCategoryCheckbox("Groceries");
      const assignedInput = await getAssignedAmountInput("Groceries");

      await user.click(checkbox);

      expect(assignedInput).toHaveFocus();
    });

    it("does not focus the assigned field when checking a category checkbox with an existing selection", async () => {
      const user = getUser();

      await selectCategory("Rent");

      const groceriesCheckbox = await getCategoryCheckbox("Groceries");
      const groceriesInput = await getAssignedAmountInput("Groceries");

      await user.click(groceriesCheckbox);

      expect(groceriesInput).not.toHaveFocus();
    });

    it("does not focus the remaining category when unchecking a category", async () => {
      const user = getUser();

      await selectCategories("Groceries", "Rent");

      const groceriesCheckbox = await getCategoryCheckbox("Groceries");
      const rentInput = await getAssignedAmountInput("Rent");

      await user.click(groceriesCheckbox);

      expect(rentInput).not.toHaveFocus();
    });
  });
  describe("keyboard", () => {
    it("clears all selected categories when Escape is pressed", async () => {
      const user = getUser();

      await selectCategories("Groceries", "Rent");
      await user.keyboard("{Escape}");

      assertNoCategoriesSelected();
    });

    it("toggles category selection with Ctrl-click", async () => {
      const user = getUser();

      await user.click(await getCategoryRow("Groceries"));

      await user.keyboard("{Control>}");
      await user.click(await getCategoryRow("Rent"));
      await user.keyboard("{/Control}");

      assertCategorySelected("Groceries");
      assertCategorySelected("Rent");

      await user.keyboard("{Control>}");
      await user.click(await getCategoryRow("Groceries"));
      await user.keyboard("{/Control}");

      assertCategoryNotSelected("Groceries");
      assertCategorySelected("Rent");
    });

    it("selects a range with Shift-click", async () => {
      const user = getUser();

      await user.click(await getCategoryRow("Groceries"));
      await user.keyboard("{Shift>}");
      await user.click(await getCategoryRow("Rent"));
      await user.keyboard("{/Shift}");

      assertCategorySelected("Groceries");
      assertCategorySelected("Extra");
      assertCategorySelected("Rent");
      assertSelectedCategoryCount(3);
    });

    it.only("uses Uncategorised as the Shift-click anchor", async () => {
      const user = getUser();

      await selectCategory("Uncategorised");
      await user.keyboard("{Shift>}");
      await user.click(await getCategoryRow("Extra"));
      await user.keyboard("{/Shift}");

      assertCategorySelected("Uncategorised");
      assertCategorySelected("Groceries");
      assertCategorySelected("Extra");
      assertCategoryNotSelected("Rent");
    });
  });
});
