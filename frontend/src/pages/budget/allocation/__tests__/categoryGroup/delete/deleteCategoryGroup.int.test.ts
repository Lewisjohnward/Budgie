import { waitFor } from "@testing-library/react";
import { renderAllocationPage } from "../../__helpers__/testUtils";
import {
  baseSnapshot,
  withAssignedSnapshot,
  withTransactionSnapshot,
} from "./deleteCategoryGroup.snapshot";
import { deleteCategoryGroupHandler } from "./deleteCategoryGroup.msw";
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
import {
  assertCategoryGroupRemoved,
  assertReadyToAssign,
  expectCategoryAmounts,
} from "../../helpers/allocation.helpers";
import { deleteCategoryGroupFromContextMenu } from "../../helpers/contextMenu.helpers";
import { setSnapshot } from "../../__helpers__/msw/state";
import { server, setupTestServer } from "../../__helpers__/msw/server";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";

setupTestServer();

const setupDeleteCategoryGroupTest = (snapshot: ApiBudgetSnapshot) => {
  setSnapshot(snapshot);
  server.use(deleteCategoryGroupHandler);
  renderAllocationPage();
  setupUser();
};

describe("category group", () => {
  describe("delete", () => {
    describe("without assigned or transactions", () => {
      beforeEach(() => {
        setupDeleteCategoryGroupTest(baseSnapshot);
      });
      it("deletes the category group", async () => {
        await deleteCategoryGroupFromContextMenu("Important");

        await assertCategoryGroupRemoved("Important");
      });
    });

    describe("with assigned", () => {
      beforeEach(() => {
        setupDeleteCategoryGroupTest(withAssignedSnapshot);
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
        setupDeleteCategoryGroupTest(withTransactionSnapshot);
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
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");

        await pressEscape();

        await deleteCategoryGroupFromContextMenu("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with cancel button", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");

        await pressCancelButton();

        await deleteCategoryGroupFromContextMenu("Groceries");
        assertInputValue("");
      });

      it("resets selected inheriting category after closing with x button", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        await selectCategoryToInherit("Rent");

        await pressCloseButton();
        await deleteCategoryGroupFromContextMenu("Groceries");

        assertInputValue("");
      });

      it("delete button is initially disabled", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
        assertDeleteButtonDisabled();
      });

      it("delete button is enabled when category is selected", async () => {
        await deleteCategoryGroupFromContextMenu("Important");
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
