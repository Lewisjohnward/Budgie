import { screen, waitFor } from "@testing-library/react";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import {
  baseSnapshot,
  withAssignedSnapshot,
  withTransactionSnapshot,
} from "./createBudgetSnapshot";
import { setupTestServer } from "./deleteCategoryGroup.msw";
import {
  assertCategoryGroupRemoved,
  deleteCategoryGroupFromContextMenu,
  openDeleteDialog,
} from "./deleteCategoryGroup.helpers";
import { setSnapshot } from "./deleteCategoryGroup.state";
import {
  assertAssignView,
  pressDeleteButton,
  assertDialogOpen,
  assertNumberOfTransactions,
  focusInput,
  assertPopoverVisible,
  pressCancelButton,
  pressCloseButton,
  assertDeleteButtonDisabled,
  assertDeleteButtonEnabled,
  assertInputValue,
  selectCategoryToInherit,
} from "../../helpers/deleteDialog.helpers";
import { setupUser } from "../../helpers/user";
import { pressEscape } from "../../helpers/global.helpers";
import { expectCategoryAmounts } from "../../helpers/allocation.helpers";
import { assertReadyToAssign } from "../../helpers/rta.helpers";

setupTestServer();

describe("category group", () => {
  describe("delete", () => {
    beforeEach(() => {
      setupUser();
    });

    it("renders the allocation page", async () => {
      setSnapshot(structuredClone(baseSnapshot));
      renderAllocationPage();
      expect(
        await screen.findByRole("button", {
          name: "Category Group",
        })
      ).toBeInTheDocument();
    });

    describe("without assigned or transactions", () => {
      beforeEach(() => {
        setSnapshot(structuredClone(baseSnapshot));
        renderAllocationPage();
      });
      it("deletes the category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        await assertCategoryGroupRemoved("Important");
      });
    });

    describe("with assigned", () => {
      beforeEach(() => {
        setSnapshot(structuredClone(withAssignedSnapshot));
        renderAllocationPage();
      });
      it("displays assigned view", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        await assertAssignView();
      });
      it("deletes the category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await pressDeleteButton();

        await assertCategoryGroupRemoved("Important");
      });
      it("updates rta available", async () => {
        await assertReadyToAssign("200.00");
        await deleteCategoryGroupFromContextMenu("Important");
        await pressDeleteButton();

        await assertReadyToAssign("700.00");
      });
    });

    describe("with transactions", () => {
      beforeEach(() => {
        setSnapshot(structuredClone(withTransactionSnapshot));
        renderAllocationPage();
      });
      it("dialog opens from context menu", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        await assertDialogOpen();
      });

      it("dialog displays correct number of categories for category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        assertNumberOfTransactions(1);
      });

      it("dialog displays correct number of transactions for category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        assertNumberOfTransactions(2);
      });

      it("input is empty when opening dialog", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        assertInputValue("");
      });

      it("category selector popover is visible when focussing input", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await focusInput();

        await assertPopoverVisible();
      });

      it("selects the top category when pressing enter", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");

        assertInputValue("Other: Rent");
      });

      it("resets selected inheriting category after closing with escape", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");

        await pressEscape();

        await openDeleteDialog("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with cancel button", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");

        await pressCancelButton();

        await openDeleteDialog("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with x button", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");

        await pressCloseButton();
        await openDeleteDialog("Groceries");

        assertInputValue("");
      });

      it("delete button is initially disabled", async () => {
        await openDeleteDialog("Groceries");
        assertDeleteButtonDisabled();
      });

      it("delete button is enabled when category is selected", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");

        assertDeleteButtonEnabled();
      });

      it("deleting removes category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertCategoryGroupRemoved("Important");
      });

      it("reassigns transactions to inheriting category", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await waitFor(() => {
          expectCategoryAmounts("Rent", {
            activity: "-£25.00",
            available: "-£25.00",
          });
        });
      });

      it("Ready to Assign updated", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertReadyToAssign("210.00");
      });
    });
  });
});
