import { screen, waitFor } from "@testing-library/react";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import {
  baseSnapshot,
  withAssignedSnapshot,
  withTransactionSnapshot,
} from "./deleteCategory.snapshot";
import { setupTestServer } from "./deleteCategory.msw";
import { setSnapshot } from "./deleteCategory.state";
import {
  assertAssignView,
  assertDeleteButtonDisabled,
  assertDeleteButtonEnabled,
  assertDialogOpen,
  assertInputValue,
  assertNumberOfTransactions,
  assertPopoverVisible,
  focusInput,
  pressCancelButton,
  pressCloseButton,
  pressDeleteButton,
  selectCategoryToInherit,
} from "../../helpers/deleteDialog.helpers";
import { pressEscape } from "../../helpers/global.helpers";
import { setupUser } from "../../helpers/user";
import { deleteCategoryFromContextMenu } from "../../helpers/contextMenu.helpers";
import {
  assertCategoryRemoved,
  assertReadyToAssign,
  expectCategoryAmounts,
} from "../../helpers/allocation.helpers";

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
        setupUser();
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
        setupUser();
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
        setupUser();
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
        await deleteCategoryFromContextMenu("Groceries");
        assertInputValue("");
      });

      it("category selector popover is visible when focussing input", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await focusInput();

        await assertPopoverVisible();
      });

      it("selects the top category when pressing enter", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");

        assertInputValue("Important: Rent");
      });

      it("resets selected inheriting category after closing with escape", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");

        await pressEscape();

        await deleteCategoryFromContextMenu("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with cancel button", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");

        await pressCancelButton();

        await deleteCategoryFromContextMenu("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with x button", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");

        await pressCloseButton();
        await deleteCategoryFromContextMenu("Groceries");

        assertInputValue("");
      });

      it("delete button is initially disabled", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        assertDeleteButtonDisabled();
      });

      it("delete button is enabled when category is selected", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");

        assertDeleteButtonEnabled();
      });

      it("deleting removes category", async () => {
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertCategoryRemoved("Groceries");
      });

      it("reassigns transactions to inheriting category", async () => {
        await deleteCategoryFromContextMenu("Groceries");
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
        await deleteCategoryFromContextMenu("Groceries");
        await selectCategoryToInherit("Rent");
        await pressDeleteButton();

        await assertReadyToAssign("210.00");
      });
    });
  });
});
