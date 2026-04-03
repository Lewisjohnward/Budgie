import { v4 as uuidv4 } from "uuid";
import { login, registerUser } from "../../utils/auth";
import {
  editAccount,
  fetchAccountByName,
  fetchAccounts,
} from "../../utils/account";
import { createAccount } from "../../utils/account";
import {
  getNewTransaction,
  getTransactionsForAccountId,
} from "../../utils/transaction";
import { getBalanceAdjustmentPayee } from "../../utils/payee";
import { getRtaMonths } from "../../utils/category";

describe("Account - Edit", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Error Cases", () => {
    it("Should return 400 when providing no updates - neither balanceAdjustment or name", async () => {
      const account = await createAccount(cookie);

      const accountBefore = await fetchAccountByName(cookie, account.name);
      const { id } = accountBefore;

      const editAccountPayload = {};
      const res = await editAccount(cookie, id, editAccountPayload);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if account doesn't exist", async () => {
      const id = uuidv4();
      const editAccountPayload = { name: "account" };
      const res = await editAccount(cookie, id, editAccountPayload);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if user doesn't own account", async () => {
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

      const editAccountPayload = { name: "account" };
      const res = await editAccount(cookie, unowned.id, editAccountPayload);
      expect(res.status).toBe(404);
    });
  });

  describe("Rename", () => {
    describe("Error Cases", () => {
      it("Should return 409 if there is a name collision", async () => {
        const account = await createAccount(cookie);
        await createAccount(cookie, {
          name: "second account",
        });

        const accountBefore = await fetchAccountByName(cookie, account.name);
        const { id } = accountBefore;

        const editAccountPayload = {
          name: "second account",
        };
        const res = await editAccount(cookie, id, editAccountPayload);
        expect(res.status).toBe(409);
      });
    });
    describe("Success", () => {
      it("Should update account name", async () => {
        const account = await createAccount(cookie);

        const accountsBefore = await fetchAccounts(cookie);
        const accountBefore = await fetchAccountByName(cookie, account.name);
        const { id } = accountBefore;
        const transactionsBefore = await getTransactionsForAccountId(
          cookie,
          id
        );

        const editAccountPayload = {
          name: "new name",
        };
        await editAccount(cookie, id, editAccountPayload);
        const accountAfter = await fetchAccountByName(
          cookie,
          editAccountPayload.name
        );
        const accountsAfter = await fetchAccounts(cookie);
        const transactionsAfter = await getTransactionsForAccountId(cookie, id);
        expect(transactionsAfter.length).toBe(transactionsBefore.length);
        const { name: _nameA, ...before } = accountBefore;
        const { name: _nameB, ...after } = accountAfter;
        expect(before).toEqual(after);
        expect(accountsAfter.length).toBe(accountsBefore.length);
      });
    });
  });

  describe("Adjust balance", () => {
    describe("Error Cases", () => {
      it("Should return 400 if providng string", async () => {
        const account = await createAccount(cookie, { balance: 100 });
        const accountBefore = await fetchAccountByName(cookie, account.name);

        const editAccountPayload = { balance: "abc" };
        const res = await editAccount(
          cookie,
          accountBefore.id,
          editAccountPayload
        );
        expect(res.status).toBe(400);
      });
    });
    describe("Positive balance", () => {
      it("Should handle smaller positive balance", async () => {
        const account = await createAccount(cookie, { balance: 100 });

        const accountBefore = await fetchAccountByName(cookie, account.name);
        const { id } = accountBefore;
        const transactionsBefore = await getTransactionsForAccountId(
          cookie,
          id
        );
        const rtaMonthsBefore = await getRtaMonths(cookie);
        expect(rtaMonthsBefore[0].available).toBe(100);

        const editAccountPayload = {
          balance: "10",
        };
        await editAccount(cookie, id, editAccountPayload);
        const transactionsAfter = await getTransactionsForAccountId(cookie, id);
        expect(transactionsAfter.length).toBe(transactionsBefore.length + 1);

        const newTransaction = getNewTransaction(
          transactionsBefore,
          transactionsAfter
        );

        expect(newTransaction).toBeDefined();
        expect(newTransaction?.outflow).toBe(90);
        expect(newTransaction?.payeeId).not.toBeNull();
        expect(newTransaction?.memo).toBeNull();

        const balanceAdjustmentPayee = await getBalanceAdjustmentPayee(cookie);
        expect(newTransaction?.payeeId).toBe(balanceAdjustmentPayee.id);

        const rtaMonthsAfter = await getRtaMonths(cookie);
        // Verify that the RTA (Remaining to Allocate) for the current month reflects
        // the new account balance after the adjustment transaction.
        expect(rtaMonthsAfter[0].available).toBe(10);
      });
      it("Should handle larger positive balance", async () => {
        const account = await createAccount(cookie, { balance: 100 });

        const accountBefore = await fetchAccountByName(cookie, account.name);
        const { id } = accountBefore;
        const transactionsBefore = await getTransactionsForAccountId(
          cookie,
          id
        );
        const rtaMonthsBefore = await getRtaMonths(cookie);
        expect(rtaMonthsBefore[0].available).toBe(100);

        const editAccountPayload = {
          balance: "120",
        };
        await editAccount(cookie, id, editAccountPayload);
        const transactionsAfter = await getTransactionsForAccountId(cookie, id);
        expect(transactionsAfter.length).toBe(transactionsBefore.length + 1);

        const newTransaction = getNewTransaction(
          transactionsBefore,
          transactionsAfter
        );

        expect(newTransaction).toBeDefined();
        expect(newTransaction?.inflow).toBe(20);
        expect(newTransaction?.payeeId).not.toBeNull();
        expect(newTransaction?.memo).toBeNull();

        const balanceAdjustmentPayee = await getBalanceAdjustmentPayee(cookie);
        expect(newTransaction?.payeeId).toBe(balanceAdjustmentPayee.id);

        const rtaMonthsAfter = await getRtaMonths(cookie);
        // Verify that the RTA (Remaining to Allocate) for the current month reflects
        // the new account balance after the adjustment transaction.
        expect(rtaMonthsAfter[0].available).toBe(120);
      });
    });
    describe("No Change", () => {
      it("Should do nothing if new balance is the same as the old balance", async () => {
        const account = await createAccount(cookie, { balance: 10 });

        const accountBefore = await fetchAccountByName(cookie, account.name);
        const { id } = accountBefore;
        const transactionsBefore = await getTransactionsForAccountId(
          cookie,
          id
        );
        const rtaMonthsBefore = await getRtaMonths(cookie);
        expect(rtaMonthsBefore[0].available).toBe(10);

        const editAccountPayload = {
          balance: "10",
        };
        await editAccount(cookie, id, editAccountPayload);
        const transactionsAfter = await getTransactionsForAccountId(cookie, id);
        expect(transactionsAfter.length).toBe(transactionsBefore.length);

        expect(transactionsBefore).toEqual(transactionsAfter);

        const rtaMonthsAfter = await getRtaMonths(cookie);
        // Verify that the RTA (Remaining to Allocate) for the current month reflects
        // the new account balance after the adjustment transaction.
        expect(rtaMonthsAfter[0].available).toBe(10);
      });
    });
    describe("Negative Balance", () => {
      it("Should handle a negative balance", async () => {
        const account = await createAccount(cookie, { balance: 100 });

        const { id } = await fetchAccountByName(cookie, account.name);
        const transactionsBefore = await getTransactionsForAccountId(
          cookie,
          id
        );
        const rtaMonthsBefore = await getRtaMonths(cookie);
        expect(rtaMonthsBefore[0].available).toBe(100);

        const editAccountPayload = {
          balance: "-10",
        };

        await editAccount(cookie, id, editAccountPayload);

        const transactionsAfter = await getTransactionsForAccountId(cookie, id);

        expect(transactionsAfter.length).toBe(transactionsBefore.length + 1);
        const newTransaction = getNewTransaction(
          transactionsBefore,
          transactionsAfter
        );

        expect(newTransaction).toBeDefined();
        expect(newTransaction?.outflow).toBe(110);
        expect(newTransaction?.payeeId).not.toBeNull();
        expect(newTransaction?.memo).toBeNull();

        const balanceAdjustmentPayee = await getBalanceAdjustmentPayee(cookie);
        expect(newTransaction?.payeeId).toBe(balanceAdjustmentPayee.id);

        const rtaMonthsAfter = await getRtaMonths(cookie);
        // Verify that the RTA (Remaining to Allocate) for the current month reflects
        // the new account balance after the adjustment transaction.
        expect(rtaMonthsAfter[0].available).toBe(-10);
      });
    });
  });
  describe("Combined Update (name & balance)", () => {
    it("Should update both name and balance in a single request", async () => {
      const account = await createAccount(cookie, { balance: 100 });

      const accountBefore = await fetchAccountByName(cookie, account.name);
      const { id } = accountBefore;

      const transactionsBefore = await getTransactionsForAccountId(cookie, id);
      const rtaMonthsBefore = await getRtaMonths(cookie);
      expect(rtaMonthsBefore[0].available).toBe(100);

      const editAccountPayload = {
        name: "updated name",
        balance: "50",
        hell: "test",
      };

      await editAccount(cookie, id, editAccountPayload);

      const accountAfter = await fetchAccountByName(
        cookie,
        editAccountPayload.name
      );
      expect(accountAfter).toBeDefined();

      const transactionsAfter = await getTransactionsForAccountId(cookie, id);
      expect(transactionsAfter.length).toBe(transactionsBefore.length + 1);

      const newTransaction = getNewTransaction(
        transactionsBefore,
        transactionsAfter
      );

      expect(newTransaction).toBeDefined();

      // 100 → 50 = outflow 50
      expect(newTransaction?.outflow).toBe(50);

      // Correct payee
      const balanceAdjustmentPayee = await getBalanceAdjustmentPayee(cookie);
      expect(newTransaction?.payeeId).toBe(balanceAdjustmentPayee.id);

      //  RTA updated
      const rtaMonthsAfter = await getRtaMonths(cookie);
      expect(rtaMonthsAfter[0].available).toBe(50);
    });
  });
});
