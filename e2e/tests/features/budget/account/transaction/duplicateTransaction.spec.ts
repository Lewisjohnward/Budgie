import { expect, test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  createTransaction,
  assertTransaction,
  assertNewTransactionsToCategorise,
  duplicateTransactions,
  assertTransactionCount,
  getTransactionRows,
  assertTransactionRows,
} from "../../helpers/transaction.helpers";
import {
  assertAccountBalance,
  openAddTransactionForm,
} from "../../helpers/account.helpers";
import { uncategorisedCategory } from "../transaction.constants";

test.describe("transaction", () => {
  test.describe("context menu", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });
    test.describe("duplicate", () => {
      test("can duplicate an outflow transaction", async ({
        page,
        request,
      }) => {
        await setupScenario(page, request, "create-transaction");
        await navigateToAccount(page, "test account");

        await openAddTransactionForm(page);

        const date = new Date();

        await createTransaction(page, {
          memo: "test transaction",
          outflow: 10,
          date,
        });

        const expectedTransaction = {
          date,
          category: uncategorisedCategory,
          memo: "test transaction",
          outflow: 10,
          inflow: 0,
        };

        await assertTransaction(page, expectedTransaction);

        await assertAccountBalance(page, "test account", -10);

        await assertNewTransactionsToCategorise(page);

        await duplicateTransactions(page, ["test transaction"]);

        await assertAccountBalance(page, "test account", -20);

        const duplicatedRows = getTransactionRows(page, ["test transaction"]);

        await expect(duplicatedRows).toHaveCount(2);

        await assertTransactionRows(page, duplicatedRows, expectedTransaction);
        await assertTransactionCount(page, 2);
      });
      test("can duplicate an inflow transaction", async ({ page, request }) => {
        await setupScenario(page, request, "create-transaction");
        await navigateToAccount(page, "test account");

        await openAddTransactionForm(page);

        const date = new Date();

        await createTransaction(page, {
          memo: "test transaction",
          inflow: 10,
          date,
        });

        const expectedTransaction = {
          date,
          category: uncategorisedCategory,
          memo: "test transaction",
          outflow: 0,
          inflow: 10,
        };
        await assertTransaction(page, expectedTransaction);

        await assertAccountBalance(page, "test account", 10);
        await assertNewTransactionsToCategorise(page);

        await duplicateTransactions(page, ["test transaction"]);

        const duplicatedRows = getTransactionRows(page, ["test transaction"]);

        await expect(duplicatedRows).toHaveCount(2);

        await assertTransactionCount(page, 2);
        await assertAccountBalance(page, "test account", 20);
      });
      test("can duplicate multiple transactions", async ({ page, request }) => {
        await setupScenario(page, request, "create-transaction");
        await navigateToAccount(page, "test account");

        await openAddTransactionForm(page);

        const date = new Date();

        await createTransaction(page, {
          memo: "test transaction inflow",
          inflow: 10,
          date,
        });

        const expectedTransaction = {
          date,
          category: uncategorisedCategory,
          memo: "test transaction inflow",
          outflow: 0,
          inflow: 10,
        };
        await assertTransaction(page, expectedTransaction);

        await createTransaction(page, {
          memo: "test transaction outflow",
          outflow: 10,
          date,
        });

        await assertAccountBalance(page, "test account", 0);
        await assertNewTransactionsToCategorise(page, 2);

        await duplicateTransactions(page, [
          "test transaction inflow",
          "test transaction outflow",
        ]);

        await assertTransactionCount(page, 4);

        await assertAccountBalance(page, "test account", 0);
        await assertNewTransactionsToCategorise(page, 4);
      });
    });
  });
});
