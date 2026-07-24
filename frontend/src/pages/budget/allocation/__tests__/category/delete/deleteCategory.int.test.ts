import { screen, waitFor } from "@testing-library/react";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import {
  baseSnapshot,
  withAssignedSnapshot,
  withTransactionSnapshot,
} from "./createBudgetSnapshot";
import { setupTestServer } from "./deleteCategory.msw";
import {
  assertCategoryRemoved,
  assertReadyToAssign,
  deleteCategoryFromContextMenu,
  expectCategoryAmounts,
  openDeleteDialog,
  setupUser,
} from "./helpers";
import { setSnapshot } from "./state";

setupTestServer();

describe("category", () => {
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
      it("deletes the category", async () => {
        await deleteCategoryFromContextMenu("Groceries");

        await assertCategoryRemoved("Groceries");
      });
    });

    describe("with assigned", () => {
      beforeEach(() => {
        setSnapshot(structuredClone(withAssignedSnapshot));
        renderAllocationPage();
      });
      it("displays assigned view", async () => {
        await deleteCategoryFromContextMenu("Groceries");

        await assertAssignView();
      });
      it("deletes the category", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await pressDeleteButton();

        await assertCategoryRemoved("Groceries");
      });

      it("updates rta available", async () => {
        await assertReadyToAssign("200.00");
        await deleteCategoryFromContextMenu("Groceries");
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
        await deleteCategoryFromContextMenu("Groceries");

        await assertDialogOpen();
      });

      it("dialog displays correct number of transactions for category", async () => {
        await deleteCategoryFromContextMenu("Groceries");

        assertNumberOfTransactions(1);
      });

      it("input is empty when opening dialog", async () => {
        await openDeleteDialog("Groceries");
        assertInputValue("");
      });

      it("category selector popover is visible when focussing input", async () => {
        await openDeleteDialog("Groceries");
        await focusInput();

        await assertPopoverVisible();
      });

      it("selects the top category when pressing enter", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");

        assertInputValue("Important: Rent");
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

      it("deleting removes category", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertCategoryRemoved("Groceries");
      });

      it("reassigns transactions to inheriting category", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await waitFor(() => {
          expectCategoryAmounts("Rent", {
            activity: "-£20.00",
            available: "-£20.00",
          });
        });
      });

      it("Ready to Assign updated", async () => {
        await openDeleteDialog("Groceries");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertReadyToAssign("210.00");
      });
    });
  });
});
