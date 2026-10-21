import { test } from "@playwright/test";
import { resetDatabase, setupScenario } from "../../../../../helpers/setup";
import { navigateToAccount } from "../../helpers/navigation.helpers";
import {
  assertAccountBalance,
  createAccount,
} from "../../helpers/account.helpers";
import {
  assertTransaction,
  assertTransactionCount,
} from "../../helpers/transaction.helpers";
import { defaultStartingBalanceTransaction } from "../transaction.constants";

test.describe("account", () => {
  test.describe("create", () => {
    test.beforeEach(async () => {
      await resetDatabase();
    });

    test("can create a bank account with zero balance", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "create-account");
      await createAccount(page, { accountName: "test account", balance: "0" });

      await navigateToAccount(page, "test account");

      await assertAccountBalance(page, "test account", 0);
      await assertTransactionCount(page, 0);
    });

    test("can create a bank account with positive balance", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "create-account");
      await createAccount(page, { accountName: "test account", balance: "10" });

      await navigateToAccount(page, "test account");

      await assertAccountBalance(page, "test account", 10);

      await assertTransaction(page, {
        date: new Date(),
        category: defaultStartingBalanceTransaction.category,
        memo: defaultStartingBalanceTransaction.memo,
        inflow: 10,
        outflow: 0,
      });
    });

    test("can create a bank account with negative balance", async ({
      page,
      request,
    }) => {
      await setupScenario(page, request, "create-account");
      await createAccount(page, {
        accountName: "test account",
        balance: "-10",
      });

      await navigateToAccount(page, "test account");
      await assertAccountBalance(page, "test account", -10);

      await assertTransaction(page, {
        date: new Date(),
        category: defaultStartingBalanceTransaction.category,
        memo: defaultStartingBalanceTransaction.memo,
        inflow: 0,
        outflow: 10,
      });
    });
  });
});
