import { getAccounts } from "../../utils/getData";
import {
  addTransactionLegacy,
  createNormalTransaction,
  createTransferTransaction,
  duplicateTransactions,
} from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import { getMonthsByCategoryId } from "../../utils/appSnapshot";
import { getRTACategory } from "../../utils/category";
import {
  createAccount,
  createAccountAndFetch,
  fetchAccountByName,
} from "../../utils/account";
import { type CreateTransactionInput } from "../../../features/budget/core/transaction/transaction.schema";

describe("Transaction Duplicate", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Response DTO", () => {
    it("Should return normal transactions using the correct DTO shape", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);

      const normal = await createNormalTransaction(cookie, {
        accountId: account1.id,
        inflow: "20",
      });

      const response = await duplicateTransactions(cookie, [normal.id]);

      expect(response.created.transactions).toHaveLength(1);

      const normalDto = response.created.transactions.find(
        (transaction) => transaction.type === "normal"
      );

      expect(normalDto).toBeDefined();

      if (normalDto?.type === "normal") {
        expect(normalDto.transaction.id).not.toBe(normal.id);
      }
    });
    it("Should return transfer pairs as a single transfer DTO", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const { source, destination } = await createTransferTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      });

      const response = await duplicateTransactions(cookie, [source.id]);

      expect(response.created.transactions).toHaveLength(1);

      const [createdTransfer] = response.created.transactions;

      expect(createdTransfer.type).toBe("transfer");

      if (createdTransfer.type !== "transfer") {
        throw new Error("Expected transfer DTO");
      }

      expect(createdTransfer.source.id).not.toBe(source.id);
      expect(createdTransfer.source.id).not.toBe(destination.id);

      expect(createdTransfer.destination.id).not.toBe(source.id);
      expect(createdTransfer.destination.id).not.toBe(destination.id);

      expect(createdTransfer.source.accountId).toBe(source.accountId);
      expect(createdTransfer.destination.accountId).toBe(destination.accountId);

      expect(createdTransfer.source.outflow).toBe(source.outflow);
      expect(createdTransfer.destination.inflow).toBe(destination.inflow);

      expect(createdTransfer.source.transferTransactionId).toBe(
        createdTransfer.destination.id
      );

      expect(createdTransfer.destination.transferTransactionId).toBe(
        createdTransfer.source.id
      );
    });
    it("Should return updated accounts as an ID-keyed record", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const { source } = await createTransferTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      });

      const response = await duplicateTransactions(cookie, [source.id]);

      expect(response.updated.accounts).toEqual(
        expect.objectContaining({
          [account1.id]: expect.objectContaining({
            id: account1.id,
            balance: -20,
          }),
          [account2.id]: expect.objectContaining({
            id: account2.id,
            balance: 20,
          }),
        })
      );

      expect(Array.isArray(response.updated.accounts)).toBe(false);
    });
    it("Should return correctly mapped normal and transfer DTOs", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const { source } = await createTransferTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      });

      const normal = await createNormalTransaction(cookie, {
        accountId: account1.id,
        inflow: "20",
      });

      const response = await duplicateTransactions(cookie, [
        source.id,
        normal.id,
      ]);

      expect(response.created.transactions).toHaveLength(2);

      const normalDto = response.created.transactions.find(
        (transaction) => transaction.type === "normal"
      );

      const transferDto = response.created.transactions.find(
        (transaction) => transaction.type === "transfer"
      );

      expect(normalDto).toBeDefined();
      expect(transferDto).toBeDefined();

      if (normalDto?.type === "normal") {
        expect(normalDto.transaction.id).not.toBe(normal!.id);
      }

      if (transferDto?.type === "transfer") {
        expect(transferDto.source.transferTransactionId).toBe(
          transferDto.destination.id
        );

        expect(transferDto.destination.transferTransactionId).toBe(
          transferDto.source.id
        );
      }
    });
    it("Should return updated months as an ID-keyed record", async () => {
      const account = await createAccountAndFetch(cookie, 0);

      const normal = await createNormalTransaction(cookie, {
        accountId: account.id,
        outflow: "20",
      });

      const rtaCategory = await getRTACategory(cookie);

      const rtaMonthsBefore = await getMonthsByCategoryId(
        cookie,
        rtaCategory.id
      );

      const categoryMonthsBefore = await getMonthsByCategoryId(
        cookie,
        normal.categoryId
      );

      categoryMonthsBefore.sort(
        (a, b) => Date.parse(a.month) - Date.parse(b.month)
      );
      rtaMonthsBefore.sort((a, b) => Date.parse(a.month) - Date.parse(b.month));

      const response = await duplicateTransactions(cookie, [normal.id]);

      expect(response.updated.months).toHaveProperty(
        categoryMonthsBefore[0].id
      );
      expect(response.updated.months).toHaveProperty(rtaMonthsBefore[1].id);

      const categoryUpdatedMonth =
        response.updated.months[categoryMonthsBefore[0].id];

      expect(categoryUpdatedMonth).toEqual(
        expect.objectContaining({
          id: categoryMonthsBefore[0].id,
          categoryId: normal.categoryId,
          month: categoryMonthsBefore[0].month,
          activity: categoryMonthsBefore[0].activity - 20,
        })
      );

      const rtaUpdatedMonth = response.updated.months[rtaMonthsBefore[1].id];

      expect(rtaUpdatedMonth).toEqual(
        expect.objectContaining({
          id: rtaMonthsBefore[1].id,
          categoryId: rtaCategory.id,
          month: rtaMonthsBefore[1].month,
          available: rtaMonthsBefore[1].available - 20,
        })
      );

      expect(Array.isArray(response.updated.months)).toBe(false);
    });
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

      const account1 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: CreateTransactionInput = {
        accountId: account1.id,
        outflow: "10",
      };

      const transaction = await addTransactionLegacy(
        cookie,
        transactionPayload,
        201
      );

      await duplicateTransactions(cookieA, [transaction!.id], 404);
    });
  });

  describe("Success", () => {
    it.skip("Should correctly duplicate normal transactions (THERE IS ONLY TESTING MIXED AND TRANSFER)", async () => {
      expect.hasAssertions();
    });
    it("Should correctly duplicate multiple transfer transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);
      const account3 = await createAccountAndFetch(cookie, 0);

      const transactionPayload1: CreateTransactionInput = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const transactionPayload2: CreateTransactionInput = {
        accountId: account1.id,
        transferAccountId: account3.id,
        inflow: "10",
      };

      // Create the original transfer
      await addTransactionLegacy(cookie, transactionPayload1, 201);
      await addTransactionLegacy(cookie, transactionPayload2, 201);

      // Get the original transactions
      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(originalResponse.transactions);

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
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: CreateTransactionInput = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      await addTransactionLegacy(cookie, transactionPayload, 201);

      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(originalResponse.transactions);

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
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transactionPayload1: CreateTransactionInput = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const transactionPayload2: CreateTransactionInput = {
        accountId: account1.id,
        inflow: "10",
      };

      const transactionPayload3: CreateTransactionInput = {
        accountId: account1.id,
        outflow: "10",
      };

      const transferTx = await addTransactionLegacy(
        cookie,
        transactionPayload1,
        201
      );
      const normalTx1 = await addTransactionLegacy(
        cookie,
        transactionPayload2,
        201
      );
      const normalTx2 = await addTransactionLegacy(
        cookie,
        transactionPayload3,
        201
      );

      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(originalResponse.transactions);

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
  describe("Side Effects", () => {
    describe("Account", () => {
      it("Should set account deletable to false when duplicating starting balance(system transaction)", async () => {
        const { name } = await createAccount(cookie, {
          name: "acc1",
          balance: "10.25",
        });

        const { transactions: transactionsBefore } = await getAccounts(cookie);
        const transactionsArray = Object.values(transactionsBefore);

        const accountInitTransaction = transactionsArray.find(
          (tx) => tx.inflow === 10.25
        );

        const accountBefore = await fetchAccountByName(cookie, name);
        expect(accountBefore.deletable).toBe(true);

        await duplicateTransactions(cookie, [accountInitTransaction?.id!]);

        const { transactions: transactionsAfter } = await getAccounts(cookie);
        const transactionsAfterArray = Object.values(transactionsAfter);

        expect(transactionsAfterArray).toHaveLength(2);

        const accountAfter = await fetchAccountByName(cookie, name);
        expect(accountAfter.deletable).toBe(false);
      });

      it("Should correctly duplicate system transactions (origin = user, no payee)", async () => {
        const { name } = await createAccount(cookie, {
          name: "acc1",
          balance: "10.25",
        });

        const { transactions: transactionsBefore } = await getAccounts(cookie);
        const transactionsArray = Object.values(transactionsBefore);

        const accountInitTransaction = transactionsArray.find(
          (tx) => tx.inflow === 10.25
        );

        expect(accountInitTransaction).toBeDefined();

        const accountBefore = await fetchAccountByName(cookie, name);
        expect(accountBefore.deletable).toBe(true);

        await duplicateTransactions(cookie, [accountInitTransaction!.id]);

        const { transactions: transactionsAfter } = await getAccounts(cookie);
        const transactionsAfterArray = Object.values(transactionsAfter);

        expect(transactionsAfterArray).toHaveLength(2);

        const duplicatedTx = transactionsAfterArray.find(
          (tx) => tx.id !== accountInitTransaction!.id
        );

        expect(duplicatedTx).toBeDefined();

        expect(duplicatedTx!.inflow).toBe(accountInitTransaction!.inflow);
        expect(duplicatedTx!.outflow).toBe(accountInitTransaction!.outflow);

        expect(duplicatedTx!.memo).toBe(accountInitTransaction!.memo);
        expect(duplicatedTx!.categoryId).toBe(
          accountInitTransaction!.categoryId
        );

        expect(duplicatedTx!.payeeId).toBeNull();

        const accountAfter = await fetchAccountByName(cookie, name);
        expect(accountAfter.deletable).toBe(false);
      });
    });
  });

  describe("Transfers", () => {
    it("Should correctly duplicate transfer transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transactionPayload: CreateTransactionInput = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      // Create the original transfer
      await addTransactionLegacy(cookie, transactionPayload, 201);

      // Get the original transactions
      const originalResponse = await getAccounts(cookie);
      const originalTransactions = Object.values(originalResponse.transactions);

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
