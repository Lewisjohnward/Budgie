import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  createTransaction,
  assertTransaction,
  assertNewTransactionsToCategorise,
} from "../../helpers/transaction.helpers";
import {
  assertAccountBalance,
  openAddTransactionForm,
} from "../../helpers/account.helpers";
import { uncategorisedCategory } from "../transaction.constants";

test.describe("transaction", () => {
  test.describe("create", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });
    test.describe("uncategorised", () => {
      test("can create an outflow transaction", async ({ page, request }) => {
        await setupScenario(page, request, "create-transaction");
        await navigateToAccount(page, "test account");

        await openAddTransactionForm(page);

        const date = new Date();

        await createTransaction(page, {
          memo: "test transaction",
          outflow: 10.0,
          date: date,
        });

        await assertTransaction(page, {
          date,
          category: uncategorisedCategory,
          memo: "test transaction",
          outflow: 10,
          inflow: 0,
        });

        await assertAccountBalance(page, "test account", -10);
        await assertNewTransactionsToCategorise(page);
      });
      test("can create an inflow transaction", async ({ page, request }) => {
        await setupScenario(page, request, "create-transaction");
        await navigateToAccount(page, "test account");

        await openAddTransactionForm(page);

        const date = new Date();

        await createTransaction(page, {
          memo: "test inflow",
          inflow: 25.0,
          date,
        });

        await assertTransaction(page, {
          date,
          category: uncategorisedCategory,
          memo: "test inflow",
          outflow: 0,
          inflow: 25,
        });

        await assertAccountBalance(page, "test account", 25);
        await assertNewTransactionsToCategorise(page);
      });
    });
  });
});
