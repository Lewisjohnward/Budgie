import { describe, it, expect } from "vitest";
import type { EditTransactionInput } from "../types";
import {
  applyOptimisticTransactionEdit,
  TransactionEditDraft,
} from "./applyOptimisticTransactionEdit";
import {
  asAccountId,
  asTransactionId,
  asCategoryId,
  asPayeeId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { produce } from "immer";

const account1 = asAccountId("account1");
const account2 = asAccountId("account2");
const account3 = asAccountId("account3");

const normalTransaction1 = asTransactionId("normalTransaction1");
const normalTransaction2 = asTransactionId("normalTransaction2");

const transferTransaction1 = asTransactionId("transferTransaction1");
const transferTransaction2 = asTransactionId("transferTransaction2");

const category1 = asCategoryId("category1");
const category2 = asCategoryId("category2");

const payee1 = asPayeeId("payee1");
const payee2 = asPayeeId("payee2");

describe("applyOptimisticTransactionEdit", () => {
  const createSnapshot = (): TransactionEditDraft => ({
    accounts: {
      [account1]: {
        balance: 1000,
      },
      [account2]: {
        balance: 500,
      },
      [account3]: {
        balance: 250,
      },
    },
    transactions: {
      [normalTransaction1]: {
        id: normalTransaction1,
        accountId: account1,
        type: "normal",
        categoryId: category1,
        payeeId: payee1,
        date: "2026-01-01",
        memo: "Transaction 1",
        inflow: 0,
        outflow: 100,
      },
      [normalTransaction2]: {
        id: normalTransaction2,
        accountId: account1,
        type: "normal",
        categoryId: category1,
        payeeId: payee1,
        date: "2026-01-02",
        memo: "Transaction 2",
        inflow: 200,
        outflow: 0,
      },
      [transferTransaction1]: {
        id: transferTransaction1,
        accountId: account1,
        type: "transfer",
        date: "2026-01-03",
        memo: "Transfer",
        inflow: 0,
        outflow: 100,
        transferTransactionId: transferTransaction2,
        transferAccountId: account2,
      },
      [transferTransaction2]: {
        id: transferTransaction2,
        accountId: account2,
        type: "transfer",
        date: "2026-01-03",
        memo: "Transfer",
        inflow: 100,
        outflow: 0,
        transferTransactionId: transferTransaction1,
        transferAccountId: account1,
      },
    },
  });

  const editTransaction = (
    transactionId: TransactionId,
    updates: EditTransactionInput["updates"],
    initialSnapshot = createSnapshot()
  ) =>
    produce(initialSnapshot, (draft) => {
      applyOptimisticTransactionEdit(draft, transactionId, updates);
    });

  describe("normal transactions", () => {
    it("updates the transaction memo", () => {
      const result = editTransaction(normalTransaction1, {
        memo: "Updated memo",
      });

      expect(result.transactions[normalTransaction1].memo).toBe("Updated memo");
    });

    it("updates the transaction date", () => {
      const result = editTransaction(normalTransaction1, {
        date: "2026-02-01",
      });

      expect(result.transactions[normalTransaction1].date).toBe("2026-02-01");
    });

    it("updates the transaction category", () => {
      const result = editTransaction(normalTransaction1, {
        categoryId: category2,
      });

      const transaction = result.transactions[normalTransaction1];

      expect(transaction.type).toBe("normal");

      if (transaction.type === "normal") {
        expect(transaction.categoryId).toBe(category2);
      }
    });

    it("updates the transaction payee", () => {
      const result = editTransaction(normalTransaction1, {
        payeeId: payee2,
      });

      const transaction = result.transactions[normalTransaction1];

      expect(transaction.type).toBe("normal");

      if (transaction.type === "normal") {
        expect(transaction.payeeId).toBe(payee2);
      }
    });

    it("updates the transaction inflow and adjusts the account balance", () => {
      const result = editTransaction(normalTransaction1, {
        inflow: 200,
      });

      const transaction = result.transactions[normalTransaction1];

      expect(transaction.inflow).toBe(200);
      expect(transaction.outflow).toBe(0);
      expect(result.accounts[account1].balance).toBe(1300);
    });

    it("updates the transaction outflow and adjusts the account balance", () => {
      const result = editTransaction(normalTransaction1, {
        outflow: 200,
      });

      const transaction = result.transactions[normalTransaction1];

      expect(transaction.inflow).toBe(0);
      expect(transaction.outflow).toBe(200);
      expect(result.accounts[account1].balance).toBe(900);
    });

    it("moves a transaction to another account and adjusts both balances", () => {
      const result = editTransaction(normalTransaction1, {
        accountId: account2,
      });

      expect(result.transactions[normalTransaction1].accountId).toBe(account2);

      expect(result.accounts[account1].balance).toBe(1100);
      expect(result.accounts[account2].balance).toBe(400);
    });

    it("does not change balances when moving a transaction to its current account", () => {
      const result = editTransaction(normalTransaction1, {
        accountId: account1,
      });

      expect(result.transactions[normalTransaction1].accountId).toBe(account1);

      expect(result.accounts[account1].balance).toBe(1000);
      expect(result.accounts[account2].balance).toBe(500);
    });
  });

  describe("transfer transactions", () => {
    it("updates the memo on both sides of a transfer", () => {
      const result = editTransaction(transferTransaction1, {
        memo: "Updated transfer memo",
      });

      expect(result.transactions[transferTransaction1].memo).toBe(
        "Updated transfer memo"
      );

      expect(result.transactions[transferTransaction2].memo).toBe(
        "Updated transfer memo"
      );
    });

    it("updates the date on both sides of a transfer", () => {
      const result = editTransaction(transferTransaction1, {
        date: "2026-02-01",
      });

      expect(result.transactions[transferTransaction1].date).toBe("2026-02-01");

      expect(result.transactions[transferTransaction2].date).toBe("2026-02-01");
    });

    it("updates the transfer amounts and adjusts both account balances", () => {
      const result = editTransaction(transferTransaction1, {
        outflow: 200,
      });

      expect(result.transactions[transferTransaction1]).toMatchObject({
        inflow: 0,
        outflow: 200,
      });

      expect(result.transactions[transferTransaction2]).toMatchObject({
        inflow: 200,
        outflow: 0,
      });

      expect(result.accounts[account1].balance).toBe(900);
      expect(result.accounts[account2].balance).toBe(600);
    });

    it("reverses outflow on the counterpart transaction", () => {
      const result = editTransaction(transferTransaction1, {
        outflow: 200,
      });

      expect(result.transactions[transferTransaction1]).toMatchObject({
        inflow: 0,
        outflow: 200,
      });

      expect(result.transactions[transferTransaction2]).toMatchObject({
        inflow: 200,
        outflow: 0,
      });
    });

    it("updates the source account and counterpart transfer account when moving a transfer", () => {
      const result = editTransaction(transferTransaction1, {
        accountId: account3,
      });

      expect(result.transactions[transferTransaction1].accountId).toBe(
        account3
      );

      const counterpart = result.transactions[transferTransaction2];

      expect(counterpart.type).toBe("transfer");

      if (counterpart.type === "transfer") {
        expect(counterpart.transferAccountId).toBe(account3);
      }

      expect(result.accounts[account1].balance).toBe(1100);
      expect(result.accounts[account3].balance).toBe(150);
      expect(result.accounts[account2].balance).toBe(500);
    });

    it("updates the destination account and counterpart when changing the transfer account", () => {
      const result = editTransaction(transferTransaction1, {
        transferAccountId: account3,
      });

      expect(result.transactions[transferTransaction1]).toMatchObject({
        accountId: account1,
        transferAccountId: account3,
      });

      expect(result.transactions[transferTransaction2]).toMatchObject({
        accountId: account3,
        transferAccountId: account1,
      });

      expect(result.accounts[account1].balance).toBe(1000);
      expect(result.accounts[account2].balance).toBe(400);
      expect(result.accounts[account3].balance).toBe(350);
    });
  });

  describe("edge cases", () => {
    it("does nothing when the transaction does not exist", () => {
      const missingTransactionId = asTransactionId("missingTransaction");

      const initialSnapshot = createSnapshot();

      const result = editTransaction(
        missingTransactionId,
        {
          memo: "Updated memo",
          outflow: 200,
        },
        initialSnapshot
      );

      expect(result).toEqual(initialSnapshot);
    });

    it("throws when updating a transaction to a nonexistent account", () => {
      const missingAccountId = asAccountId("missingAccount");

      expect(() =>
        editTransaction(normalTransaction1, {
          accountId: missingAccountId,
        })
      ).toThrow(`Account not found: ${missingAccountId}`);
    });

    it("does not mutate the original snapshot", () => {
      const originalSnapshot = createSnapshot();

      const result = editTransaction(
        normalTransaction1,
        {
          memo: "Updated memo",
          outflow: 200,
        },
        originalSnapshot
      );

      expect(originalSnapshot.transactions[normalTransaction1].memo).toBe(
        "Transaction 1"
      );

      expect(originalSnapshot.transactions[normalTransaction1].outflow).toBe(
        100
      );

      expect(originalSnapshot.accounts[account1].balance).toBe(1000);

      expect(result.transactions[normalTransaction1].memo).toBe("Updated memo");

      expect(result.accounts[account1].balance).toBe(900);
    });
  });
});
