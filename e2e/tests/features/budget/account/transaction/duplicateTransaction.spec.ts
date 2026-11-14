import { expect, test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  assertNewTransactionsToCategorise,
  duplicateTransactions,
  assertTransactionCount,
  getTransactionRows,
  assertTransactionRows,
  deleteTransactions,
  getTransactionCount,
} from "../../helpers/transaction.helpers";
import { assertAccountBalance } from "../../helpers/account.helpers";
import { uncategorisedCategory } from "../transaction.constants";

test.describe("duplicate transaction", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });
  test.describe("context menu", () => {
    test("can duplicate an outflow transaction", async ({ page, request }) => {
      await setupScenario(
        page,
        request,
        "context-menu-duplicate-outflow-transaction"
      );
      await navigateToAccount(page, "test account");

      const date = new Date();

      const expectedDuplicateTransaction = {
        date,
        category: uncategorisedCategory,
        memo: "test transaction",
        outflow: 10,
        inflow: 0,
      };

      await duplicateTransactions(page, ["test transaction"]);

      await assertAccountBalance(page, "test account", -20);

      const duplicatedRows = getTransactionRows(page, ["test transaction"]);

      await expect(duplicatedRows).toHaveCount(2);

      await assertTransactionRows(
        page,
        duplicatedRows,
        expectedDuplicateTransaction
      );
      await assertTransactionCount(page, 2);
    });
    test("can duplicate multiple transactions", async ({ page, request }) => {
      await setupScenario(
        page,
        request,
        "context-menu-duplicate-multiple-transactions"
      );
      await navigateToAccount(page, "test account");

      await duplicateTransactions(page, [
        "test transaction inflow",
        "test transaction outflow",
      ]);

      await assertTransactionCount(page, 4);

      await assertAccountBalance(page, "test account", 0);
      await assertNewTransactionsToCategorise(page, 4);
    });
    test.describe("delete", () => {
      test("can delete an outflow transaction", async ({ page, request }) => {
        await setupScenario(
          page,
          request,
          "context-menu-delete-outflow-transaction"
        );
        await navigateToAccount(page, "test account");

        const transactionCountBefore = await getTransactionCount(page);

        await deleteTransactions(page, ["test transaction"]);

        const transactionCountAfter = await getTransactionCount(page);

        expect(transactionCountBefore - 1).toBe(transactionCountAfter);

        const rows = getTransactionRows(page, ["test transaction"]);
        await expect(rows).toHaveCount(0);

        await assertAccountBalance(page, "test account", 0);
      });
      test("can delete multiple transactions", async ({ page, request }) => {
        await setupScenario(
          page,
          request,
          "context-menu-delete-multiple-transactions"
        );
        await navigateToAccount(page, "test account");

        const transactionCountBefore = await getTransactionCount(page);

        await deleteTransactions(page, [
          "test transaction inflow",
          "test transaction outflow",
        ]);
        const transactionCountAfter = await getTransactionCount(page);

        expect(transactionCountBefore - 2).toBe(transactionCountAfter);

        const rows = getTransactionRows(page, [
          "test transaction inflow",
          "test transaction outflow",
        ]);

        await expect(rows).toHaveCount(0);
        await assertAccountBalance(page, "test account", 0);
      });
    });
  });
});
