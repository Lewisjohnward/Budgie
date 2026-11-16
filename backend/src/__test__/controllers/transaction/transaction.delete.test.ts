import { getAccounts } from "../../utils/getData";
import {
  addTransactionLegacy,
  createNormalTransaction,
  createTransferTransaction,
  deleteTransactions,
  TestInsertTransactionInputWithoutUserId,
} from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import {
  createAccount,
  createAccountAndFetch,
  fetchAccountByName,
} from "../../utils/account";
import {
  getMonthsByCategoryId,
  getRtaCategory,
  getTestCategory,
  getUserCategoryByName,
} from "../../utils/appSnapshot";

describe("Transaction Delete", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Response DTO", () => {
    it("Should return the correctly mapped DTO when deleting a normal transaction", async () => {
      const account = await createAccountAndFetch(cookie, 0, "test-account");
      const category = await getTestCategory(cookie);
      const rtaCategory = await getRtaCategory(cookie);

      const months = await getMonthsByCategoryId(cookie, category.id);
      const rtaMonths = await getMonthsByCategoryId(cookie, rtaCategory.id);

      const transactionPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account.id,
        categoryId: category.id,
        outflow: "10",
      };

      const tx = await createNormalTransaction(cookie, transactionPayload);

      const dto = await deleteTransactions(cookie, [tx.id]);

      expect(dto.updated.accounts).toEqual({
        [account.id]: {
          id: account.id,
          name: "test-account",
          position: 0,
          open: true,
          type: "BANK",
          balance: 0,
          deletable: true,
        },
      });

      const currentCategoryMonth = months[0];
      const nextRtaMonth = rtaMonths[1];

      expect(dto.updated.months).toEqual({
        [currentCategoryMonth.id]: currentCategoryMonth,
        [nextRtaMonth.id]: nextRtaMonth,
      });

      expect(dto.deleted.transactions).toEqual({
        [tx.id]: tx,
      });
    });
    it("Should return the correctly mapped DTO when deleting a transfer transaction", async () => {
      const account1 = await createAccountAndFetch(cookie, 0, "account-1");
      const account2 = await createAccountAndFetch(cookie, 0, "account-2");

      const tx = await createTransferTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      });

      const dto = await deleteTransactions(cookie, [tx.source.id]);

      expect(dto.updated.accounts).toEqual({
        [account1.id]: {
          id: account1.id,
          name: "account-1",
          balance: 0,
          deletable: true,
          open: true,
          position: 0,
          type: "BANK",
        },
        [account2.id]: {
          id: account2.id,
          name: "account-2",
          balance: 0,
          deletable: true,
          open: true,
          position: 1,
          type: "BANK",
        },
      });

      expect(dto.updated.months).toEqual({});

      const sourceTx = tx.source;
      const destinationTx = tx.destination;

      expect(dto.deleted.transactions).toEqual({
        [sourceTx.id]: sourceTx,
        [destinationTx.id]: destinationTx,
      });
    });
    it("Should return the correctly mapped DTO when deleting multiple transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0, "account-1");
      const account2 = await createAccountAndFetch(cookie, 0, "account-2");

      const rtaCategory = await getRtaCategory(cookie);
      const rtaMonths = await getMonthsByCategoryId(cookie, rtaCategory.id);

      const testCategory = await getTestCategory(cookie);
      const testCategoryMonths = await getMonthsByCategoryId(
        cookie,
        testCategory.id
      );

      const normalTx = await createNormalTransaction(cookie, {
        accountId: account1.id,
        categoryId: testCategory.id,
        outflow: "10",
      });

      const transferTx = await createTransferTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "20",
      });

      const dto = await deleteTransactions(cookie, [
        normalTx.id,
        transferTx.source.id,
      ]);

      expect(dto.updated.accounts).toEqual({
        [account1.id]: {
          id: account1.id,
          name: "account-1",
          balance: 0,
          deletable: true,
          open: true,
          position: 0,
          type: "BANK",
        },
        [account2.id]: {
          id: account2.id,
          name: "account-2",
          balance: 0,
          deletable: true,
          open: true,
          position: 1,
          type: "BANK",
        },
      });

      const currentTestCategoryMonth = testCategoryMonths[0];
      const nextRtaMonth = rtaMonths[1];

      expect(dto.updated.months).toEqual({
        [currentTestCategoryMonth.id]: currentTestCategoryMonth,
        [nextRtaMonth.id]: nextRtaMonth,
      });

      expect(dto.deleted.transactions).toEqual({
        [normalTx.id]: normalTx,
        [transferTx.source.id]: transferTx.source,
        [transferTx.destination.id]: transferTx.destination,
      });
    });
    it("Should return the correctly mapped DTO when deleting multiple normal transactions from different categories", async () => {
      const account = await createAccountAndFetch(cookie, 0, "test-account");

      const rtaCategory = await getRtaCategory(cookie);
      const testCategory = await getUserCategoryByName(
        cookie,
        "another test category"
      );

      const rtaMonths = await getMonthsByCategoryId(cookie, rtaCategory.id);
      const testCategoryMonths = await getMonthsByCategoryId(
        cookie,
        testCategory.id
      );

      const tx1 = await createNormalTransaction(cookie, {
        accountId: account.id,
        categoryId: testCategory.id,
        outflow: "10",
      });

      const tx2 = await createNormalTransaction(cookie, {
        accountId: account.id,
        categoryId: rtaCategory.id,
        inflow: "20",
      });

      const dto = await deleteTransactions(cookie, [tx1.id, tx2.id]);

      expect(dto.updated.accounts).toEqual({
        [account.id]: {
          id: account.id,
          name: "test-account",
          balance: 0,
          deletable: true,
          open: true,
          position: 0,
          type: "BANK",
        },
      });

      const currentTestCategoryMonth = testCategoryMonths[0];
      const currentRtaMonth = rtaMonths[0];
      const nextRtaMonth = rtaMonths[1];

      expect(dto.updated.months).toEqual({
        [currentTestCategoryMonth.id]: currentTestCategoryMonth,
        [currentRtaMonth.id]: currentRtaMonth,
        [nextRtaMonth.id]: nextRtaMonth,
      });

      expect(dto.deleted.transactions).toEqual({
        [tx1.id]: tx1,
        [tx2.id]: tx2,
      });
    });
  });

  describe("Error Cases", () => {
    it("Should return 400 if no transactions provided", async () => {
      await deleteTransactions(cookie, [], 400);
    });

    it("Should return 404 if transactions provided are invalid", async () => {
      await deleteTransactions(
        cookie,
        ["550e8400-e29b-41d4-a716-446655440000"],
        404
      );
    });

    it("Should return 404 if transactions provided are not owned by user", async () => {
      await registerUser({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const cookieA = await login({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const account1 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transaction = await addTransactionLegacy(
        cookie,
        transactionPayload,
        201
      );

      await deleteTransactions(cookieA, [transaction!.id], 404);
    });
  });

  describe("Success", () => {
    it("Should correctly handle transfer transaction deletion", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const tx = await addTransactionLegacy(cookie, transactionPayload, 201);

      await deleteTransactions(cookie, [tx!.id]);
      const { transactions, accounts } = await getAccounts(cookie);

      const txsArr = Object.values(transactions);
      expect(txsArr.length).toBe(0);
      expect(txsArr.length).toBe(0);

      expect(accounts[account1.id].balance).toBe(0);
      expect(accounts[account2.id].balance).toBe(0);
    });
    it("Should correctly handle normal transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transaction = await addTransactionLegacy(
        cookie,
        transactionPayload,
        201
      );

      await deleteTransactions(cookie, [transaction!.id]);
      const { transactions, accounts } = await getAccounts(cookie);

      const txsArr = Object.values(transactions);
      const accountsArr = Object.values(accounts);
      const account = accountsArr[0];
      expect(txsArr.length).toBe(0);
      expect(accountsArr.length).toBe(1);
      expect(account.balance).toBe(0);
    });
    it("Should correctly handle both normal transactions and transfer transactions ", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transferTxPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const txPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transferTx = await addTransactionLegacy(
        cookie,
        transferTxPayload,
        201
      );
      const tx = await addTransactionLegacy(cookie, txPayload, 201);

      await deleteTransactions(cookie, [transferTx!.id, tx!.id]);
      const { transactions, accounts } = await getAccounts(cookie);

      const txsArr = Object.values(transactions);
      const accountsArr = Object.values(accounts);
      expect(txsArr.length).toBe(0);
      expect(accountsArr.length).toBe(2);
      const [acc1, acc2] = accountsArr;
      expect(acc1.balance).toBe(0);
      expect(acc2.balance).toBe(0);
    });
    it("Should handle deletion of both sides of transfer transactons", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transferTxPayload: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      await addTransactionLegacy(cookie, transferTxPayload);

      const { transactions } = await getAccounts(cookie);
      const transferTransactions = Object.values(transactions).filter(
        (t) => t.transferTransactionId !== null
      );
      expect(transferTransactions).toHaveLength(2);

      await deleteTransactions(
        cookie,
        transferTransactions.map((t) => t.id)
      );

      const finalState = await getAccounts(cookie);
      expect(Object.values(finalState.transactions).length).toBe(0);
      expect(finalState.accounts[account1.id].balance).toBe(0);
      expect(finalState.accounts[account2.id].balance).toBe(0);
    });
  });
  describe("Side Effects", () => {
    describe("Account", () => {
      it("Should change account to deletable when deleting the last user transaction", async () => {
        const { name } = await createAccount(cookie, { name: "acc1" });

        const { id } = await fetchAccountByName(cookie, name);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: id,
          outflow: "10",
        };

        const transaction = await addTransactionLegacy(
          cookie,
          transactionPayload,
          201
        );

        expect(transaction).toBeDefined();

        const accountBefore = await fetchAccountByName(cookie, name);
        expect(accountBefore.deletable).toBe(false);

        await deleteTransactions(cookie, [transaction!.id]);

        const accountAfter = await fetchAccountByName(cookie, name);

        expect(accountAfter.deletable).toBe(true);
      });
      it("Should change account to deletable when deleting all transactions", async () => {
        const { name } = await createAccount(cookie, { name: "acc1" });

        const { transactions } = await getAccounts(cookie);
        const transactionIdsArray = Object.values(transactions).map(
          (tx) => tx.id
        );

        const accountBefore = await fetchAccountByName(cookie, name);
        expect(accountBefore.deletable).toBe(true);

        await deleteTransactions(cookie, transactionIdsArray);

        const accountAfter = await fetchAccountByName(cookie, name);

        expect(accountAfter.deletable).toBe(true);
      });
    });
  });
});
