import { expect, test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  getTransactionRows,
  deleteTransactions,
  getTransactionCount,
} from "../../helpers/transaction.helpers";
import { assertAccountBalance } from "../../helpers/account.helpers";

test.describe("delete transaction", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });
  test.describe("context menu", () => {
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
