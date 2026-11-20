import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  getTransactionRows,
  assertTransactionRows,
  editTransaction,
} from "../../helpers/transaction.helpers";
import { uncategorisedCategory } from "../transaction.constants";
import { assertAccountBalance } from "../../helpers/account.helpers";

test.describe("edit transaction", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase();
    await setupScenario(page, request, "edit-transaction");
    await navigateToAccount(page, "test account");
  });

  test("can edit the date of a transaction", async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await editTransaction(page, "test transaction", { date: yesterday });

    const editedRow = getTransactionRows(page, ["test transaction"]);

    await assertTransactionRows(page, editedRow, {
      date: yesterday,
      category: uncategorisedCategory,
      memo: "test transaction",
      outflow: 10,
      inflow: 0,
    });
  });

  test("can edit the category of a transaction", async ({ page }) => {
    await editTransaction(page, "test transaction", { category: "e2e-test" });

    const editedRow = getTransactionRows(page, ["test transaction"]);

    await assertTransactionRows(page, editedRow, {
      date: new Date(),
      category: "test : e2e-test",
      memo: "test transaction",
      outflow: 10,
      inflow: 0,
    });
  });

  test("can edit the memo of a transaction", async ({ page }) => {
    await editTransaction(page, "test transaction", { memo: "edited memo" });

    const editedRow = getTransactionRows(page, ["edited memo"]);

    await assertTransactionRows(page, editedRow, {
      date: new Date(),
      category: uncategorisedCategory,
      memo: "edited memo",
      outflow: 10,
      inflow: 0,
    });
  });

  test("can edit the outflow of a transaction", async ({ page }) => {
    await editTransaction(page, "test transaction", { outflow: 20 });

    await assertAccountBalance(page, "test account", -20);

    const editedRow = getTransactionRows(page, ["test transaction"]);

    await assertTransactionRows(page, editedRow, {
      date: new Date(),
      category: uncategorisedCategory,
      memo: "test transaction",
      outflow: 20,
      inflow: 0,
    });
  });

  test("can edit the inflow of a transaction", async ({ page }) => {
    await editTransaction(page, "test transaction", { outflow: 0, inflow: 20 });

    await assertAccountBalance(page, "test account", 20);

    const editedRow = getTransactionRows(page, ["test transaction"]);

    await assertTransactionRows(page, editedRow, {
      date: new Date(),
      category: uncategorisedCategory,
      memo: "test transaction",
      outflow: 0,
      inflow: 20,
    });
  });

  test("can edit multiple transaction fields", async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await editTransaction(page, "test transaction", {
      date: yesterday,
      memo: "updated transaction",
      outflow: 20,
      category: "e2e-test",
    });

    await assertAccountBalance(page, "test account", -20);

    const editedRow = getTransactionRows(page, ["updated transaction"]);

    await assertTransactionRows(page, editedRow, {
      date: yesterday,
      category: "test : e2e-test",
      memo: "updated transaction",
      outflow: 20,
      inflow: 0,
    });
  });
});
