import { v4 as uuidv4 } from "uuid";
import { login, registerUser } from "../../utils/auth";
import { fetchAccountByName, toggleCloseAccount } from "../../utils/account";
import { createAccount } from "../../utils/account";
import {
  addTransaction,
  getClosedAccountTransaction,
  TestInsertTransactionInputWithoutUserId,
} from "../../utils/transaction";
import { getBalanceAdjustmentPayee } from "../../utils/payee";

describe("Account - Close", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Toggle close account", () => {
    describe("Error Cases", () => {
      it("Should return 409 when closing a deletable account", async () => {
        const account = await createAccount(cookie);

        const accountBefore = await fetchAccountByName(cookie, account.name);
        expect(accountBefore.open).toBe(true);
        expect(accountBefore.deletable).toBe(true);

        const { id } = accountBefore;
        const resCloseAccount = await toggleCloseAccount(cookie, id);
        expect(resCloseAccount.status).toBe(409);

        const accountAfter = await fetchAccountByName(cookie, account.name);
        expect(accountAfter.open).toBe(true);
        expect(accountAfter.deletable).toBe(true);

        expect(accountBefore).toEqual(accountAfter);
      });
      it("Should return 404 if account isn't owned by user", async () => {
        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });
        const unownedAccount = await createAccount(cookie2, {
          name: "unowned",
        });

        const unowned = await fetchAccountByName(cookie2, unownedAccount.name);
        const resDeleteAccount = await toggleCloseAccount(cookie, unowned.id);
        expect(resDeleteAccount.status).toBe(404);
      });
      it("Should return 404 if account doesn't exist", async () => {
        const id = uuidv4();
        const resCloseAccount = await toggleCloseAccount(cookie, id);
        expect(resCloseAccount.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should close account that is closeable (i.e. not deletable - it has user transactions) and add manual balance adjustment transaction with Closing account memo", async () => {
        const account = await createAccount(cookie);

        const accountBefore = await fetchAccountByName(cookie, account.name);
        expect(accountBefore.open).toBe(true);
        expect(accountBefore.deletable).toBe(true);

        const { id } = accountBefore;
        const transaction: TestInsertTransactionInputWithoutUserId = {
          accountId: id,
          outflow: "10",
        };

        await addTransaction(cookie, transaction);

        const accountAfterTransaction = await fetchAccountByName(
          cookie,
          account.name
        );
        expect(accountAfterTransaction.open).toBe(true);
        expect(accountAfterTransaction.deletable).toBe(false);

        const resCloseAccount = await toggleCloseAccount(cookie, id);
        expect(resCloseAccount.status).toBe(200);

        const closedAccountTransaction = await getClosedAccountTransaction(
          cookie,
          id
        );
        const balanceAdjustmentPayee = await getBalanceAdjustmentPayee(cookie);
        expect(closedAccountTransaction).toBeDefined();
        expect(closedAccountTransaction?.payeeId).toBe(
          balanceAdjustmentPayee.id
        );
        expect(closedAccountTransaction?.memo).toBe("Closed Account");
        expect(closedAccountTransaction?.inflow).toBe(0);
        expect(closedAccountTransaction?.outflow).toBe(90);

        const accountAfter = await fetchAccountByName(cookie, account.name);
        expect(accountAfter.open).toBe(false);
        expect(accountAfter.balance).toBe(0);
      });
      it("Should open account that is closed", async () => {
        const account = await createAccount(cookie);

        const accountBefore = await fetchAccountByName(cookie, account.name);

        const { id } = accountBefore;
        const transaction: TestInsertTransactionInputWithoutUserId = {
          accountId: id,
          outflow: "10",
        };

        await addTransaction(cookie, transaction);

        await toggleCloseAccount(cookie, id);

        const accountAfterClosing = await fetchAccountByName(
          cookie,
          account.name
        );
        expect(accountAfterClosing.open).toBe(false);
        expect(accountAfterClosing.balance).toBe(0);

        await toggleCloseAccount(cookie, id);
        const accountAfterReopening = await fetchAccountByName(
          cookie,
          account.name
        );
        expect(accountAfterReopening.open).toBe(true);
        expect(accountAfterReopening.balance).toBe(0);
      });
    });
  });
});
