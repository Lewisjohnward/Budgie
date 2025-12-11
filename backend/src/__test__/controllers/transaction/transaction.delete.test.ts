import { getAccounts } from "../../utils/getData";
import { createTestAccount } from "../../utils/createTestAccount";
import { addTransaction, deleteTransactions } from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import { TransactionPayload } from "../../../features/budget/transaction/transaction.schema";

describe("Transaction Delete", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
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

      const account1 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const transaction = await addTransaction(
        cookie,
        transactionPayload,
        200
      );

      await deleteTransactions(cookieA, [transaction!.id], 404);
    });
  });

  describe("Success", () => {
    it("Should correctly handle transfer transaction deletion", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const tx = await addTransaction(cookie, transactionPayload, 200);

      await deleteTransactions(cookie, [tx!.id]);
      const { transactions, accounts } = await getAccounts(cookie);

      const txsArr = Object.values(transactions);
      expect(txsArr.length).toBe(0);
      expect(txsArr.length).toBe(0);

      expect(accounts[account1.id].balance).toBe(0);
      expect(accounts[account2.id].balance).toBe(0);
    });
    it("Should correctly handle normal transactions", async () => {
      const account1 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const transaction = await addTransaction(
        cookie,
        transactionPayload,
        200
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
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transferTxPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const txPayload: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const transferTx = await addTransaction(cookie, transferTxPayload, 200);
      const tx = await addTransaction(cookie, txPayload, 200);

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
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transferTxPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      await addTransaction(cookie, transferTxPayload);

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
});
