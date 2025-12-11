import { getAccounts } from "../../utils/getData";
import { createTestAccount } from "../../utils/createTestAccount";
import { addTransaction, duplicateTransactions } from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import { TransactionPayload } from "../../../features/budget/transaction/transaction.schema";

describe("Transaction Duplicate", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Error Cases", () => {
    it("Should return 400 if no transactions provided", async () => {
      await duplicateTransactions(cookie, [], 400);
    });
    it("Should return 404 if transactions provided are invalid", async () => {
      await duplicateTransactions(
        cookie,
        ["550e8400-e29b-41d4-a716-446655440000"],
        404
      );
    });
    it("Should return 404 if user doesn't own transactions", async () => {
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

      await duplicateTransactions(cookieA, [transaction!.id], 404);
    });
  });

  describe("Success", () => {
    it("Should correctly duplicate multiple transfer transactions", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);
      const account3 = await createTestAccount(cookie, 0);

      const transactionPayload1: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const transactionPayload2: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account3.id,
        inflow: "10",
      };

      // Create the original transfer
      await addTransaction(cookie, transactionPayload1, 200);
      await addTransaction(cookie, transactionPayload2, 200);

      // Get the original transactions
      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(
        originalResponse.transactions
      );

      const [originalTx1, originalTx2, originalTx3, originalTx4] =
        originalTransactions;

      // Verify original transfers are correct
      expect(originalTx1.transferTransactionId).toBe(originalTx3.id);
      expect(originalTx2.transferTransactionId).toBe(originalTx4.id);

      expect(originalTx3.transferTransactionId).toBe(originalTx1.id);
      expect(originalTx4.transferTransactionId).toBe(originalTx2.id);

      // Duplicate the transaction
      await duplicateTransactions(cookie, [originalTx1.id, originalTx4.id]);

      const { transactions, accounts } = await getAccounts(cookie);
      const transactionsArray = Object.values(transactions);

      // Should have 8 transactions now (original 4 + new 4)
      expect(transactionsArray).toHaveLength(8);
      const transactionMap = new Map(
        transactionsArray.map((tx) => [tx.id, tx])
      );

      // Verify all transactions have a valid transfer partner
      for (const tx of transactionsArray) {
        if (tx.transferTransactionId) {
          const partner = transactionMap.get(tx.transferTransactionId);
          expect(partner).toBeDefined();
          expect(partner!.transferTransactionId).toBe(tx.id);
        }
      }

      // Verify we have the expected number of transfer pairs
      const transferPairs = new Set();
      for (const tx of transactionsArray) {
        if (tx.transferTransactionId) {
          const pair = [tx.id, tx.transferTransactionId].sort().join("-");
          transferPairs.add(pair);
        }
      }
      expect(transferPairs.size).toBe(4);

      // Verify account balances
      expect(accounts[account1.id].balance).toBe(0);
      expect(accounts[account2.id].balance).toBe(20);
      expect(accounts[account3.id].balance).toBe(-20);
    });
    it("Should handle duplicating both sides of a transfer", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      await addTransaction(cookie, transactionPayload, 200);

      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(
        originalResponse.transactions
      );

      const [transferTx1, transferTx2] = originalTransactions;

      expect(originalTransactions).toHaveLength(2);

      await duplicateTransactions(cookie, [transferTx1.id, transferTx2.id]);

      const { transactions } = await getAccounts(cookie);
      const transactionsArray = Object.values(transactions);

      expect(transactionsArray).toHaveLength(4);

      // Verify we have the expected number of transfer pairs
      const transferPairs = new Set();
      for (const tx of transactionsArray) {
        if (tx.transferTransactionId) {
          const pair = [tx.id, tx.transferTransactionId].sort().join("-");
          transferPairs.add(pair);
        }
      }
      expect(transferPairs.size).toBe(2);
    });

    it("Should correctly duplicate both transfer and normal transactions", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transactionPayload1: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const transactionPayload2: TransactionPayload = {
        accountId: account1.id,
        inflow: "10",
      };

      const transactionPayload3: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const transferTx = await addTransaction(
        cookie,
        transactionPayload1,
        200
      );
      const normalTx1 = await addTransaction(
        cookie,
        transactionPayload2,
        200
      );
      const normalTx2 = await addTransaction(
        cookie,
        transactionPayload3,
        200
      );

      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(
        originalResponse.transactions
      );

      expect(originalTransactions).toHaveLength(4);

      await duplicateTransactions(cookie, [
        transferTx!.id,
        normalTx1!.id,
        normalTx2!.id,
      ]);

      const { transactions, accounts } = await getAccounts(cookie);
      const transactionsArray = Object.values(transactions);

      expect(transactionsArray).toHaveLength(8);

      // Verify we have the expected number of transfer pairs
      const transferPairs = new Set();
      for (const tx of transactionsArray) {
        if (tx.transferTransactionId) {
          const pair = [tx.id, tx.transferTransactionId].sort().join("-");
          transferPairs.add(pair);
        }
      }
      expect(transferPairs.size).toBe(2);

      expect(accounts[account1.id].balance).toBe(-20);
      expect(accounts[account2.id].balance).toBe(20);
    });
  });

  describe("Transfers", () => {
    it("Should correctly duplicate transfer transactions", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      // Create the original transfer
      await addTransaction(cookie, transactionPayload, 200);

      // Get the original transactions
      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(
        originalResponse.transactions
      );

      // Original transfer pair (indices 0 and 1)
      const [originalTx1, originalTx2] = originalTransactions;

      // Duplicate the transaction
      await duplicateTransactions(cookie, [originalTx1.id]);

      const { transactions, accounts } = await getAccounts(cookie);
      const transactionsArray = Object.values(transactions);

      // Should have 4 transactions now (original pair + new pair)
      expect(transactionsArray).toHaveLength(4);

      // Original transactions are at indices 0 and 2
      expect(transactionsArray[0].id).toBe(originalTx1.id);
      expect(transactionsArray[2].id).toBe(originalTx2.id);

      // New transactions are at indices 1 and 3
      const newTx1 = transactionsArray[1];
      const newTx2 = transactionsArray[3];

      // Verify the transfer pairs
      // Original transaction 0 is linked to new transaction 2
      expect(newTx1.transferTransactionId).toBe(newTx2.id);
      expect(newTx2.transferTransactionId).toBe(newTx1.id);

      // Verify account balances
      expect(accounts[account1.id].balance).toBe(-20); // -10 from original, -10 from duplicate
      expect(accounts[account2.id].balance).toBe(20); // +10 from original, +10 from duplicate

      // Verify properties were copied correctly (excluding IDs and timestamps)
      const propsToCheck = [
        "accountId",
        "outflow",
        "inflow",
        "payeeId",
        "categoryId",
        "memo",
        "cleared",
      ] as const;
      for (const prop of propsToCheck) {
        expect(newTx1[prop]).toBe(originalTx1[prop]);
        expect(newTx2[prop]).toBe(originalTx2[prop]);
      }

      // Verify dates are the same (ignoring timezone issues)
      expect(new Date(newTx1.date).toISOString()).toBe(
        new Date(originalTx1.date).toISOString()
      );
      expect(new Date(newTx2.date).toISOString()).toBe(
        new Date(originalTx2.date).toISOString()
      );
    });
    it.todo("Should create new paired transfer with new IDs");
    it.todo("Should update account balances correctly");
  });
});
