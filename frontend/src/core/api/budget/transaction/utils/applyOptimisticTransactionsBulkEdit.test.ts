import { describe, it, expect } from "vitest";
import {
  applyOptimisticTransactionsBulkEdit,
  TransactionsBulkEditDraft,
} from "./applyOptimisticTransactionsBulkEdit";
import {
  asAccountId,
  asCategoryId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { produce } from "immer";
import { EditBulkTransactionsInput } from "../types";

const account1 = asAccountId("account1");
const account2 = asAccountId("account2");
const account3 = asAccountId("account3");

const normalTransaction1 = asTransactionId("transaction1");
const normalTransaction2 = asTransactionId("transaction2");
const transferTransaction1 = asTransactionId("transferTransaction1");
const transferTransaction2 = asTransactionId("transferTransaction2");

const category1 = asCategoryId("catgory1");
const category2 = asCategoryId("catgory2");

describe("applyOptimisticTransactionsBulkEdit", () => {
  const createSnapshot = (): TransactionsBulkEditDraft => ({
    accounts: {
      [account1]: {
        balance: 1000,
      },
      [account2]: {
        balance: 500,
      },
      [account3]: { balance: 250 },
    },
    transactions: {
      [normalTransaction1]: {
        id: normalTransaction1,
        accountId: account1,
        categoryId: category1,
        type: "normal",
        inflow: 0,
        outflow: 100,
        memo: "",
      },
      [normalTransaction2]: {
        id: normalTransaction2,
        accountId: account1,
        categoryId: category1,
        type: "normal",
        inflow: 200,
        outflow: 0,
        memo: "",
      },
      [transferTransaction1]: {
        id: transferTransaction1,
        accountId: account1,
        type: "transfer",
        inflow: 0,
        outflow: 100,
        memo: "",
        transferTransactionId: transferTransaction2,
        transferAccountId: account2,
      },
      [transferTransaction2]: {
        id: transferTransaction2,
        accountId: account2,
        type: "transfer",
        inflow: 100,
        outflow: 0,
        memo: "",
        transferTransactionId: transferTransaction1,
        transferAccountId: account1,
      },
    },
  });

  const editBulkTransactions = (
    snapshot: TransactionsBulkEditDraft,
    mutation: EditBulkTransactionsInput
  ): TransactionsBulkEditDraft =>
    produce(snapshot, (draft) => {
      applyOptimisticTransactionsBulkEdit(draft, mutation);
    });

  describe("memo", () => {
    it("updates a normal transaction memo", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1],
        updates: {
          memo: "test memo",
        },
      });

      expect(result.transactions[normalTransaction1].memo).toBe("test memo");
      expect(result.transactions[normalTransaction2].memo).toBe("");
    });
    it("updates provded side of a transfer transaction memo", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [transferTransaction1],
        updates: {
          memo: "test memo",
        },
      });

      expect(result.transactions[transferTransaction1].memo).toBe("test memo");
      expect(result.transactions[transferTransaction2].memo).toBe("");
    });
    it("updates both side of a transfer transaction when provided", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [transferTransaction1, transferTransaction2],
        updates: {
          memo: "test memo",
        },
      });

      expect(result.transactions[transferTransaction1].memo).toBe("test memo");
      expect(result.transactions[transferTransaction2].memo).toBe("test memo");
    });
    it("updates multiple transactions", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [
          normalTransaction1,
          transferTransaction1,
          transferTransaction2,
        ],
        updates: {
          memo: "test memo",
        },
      });

      expect(result.transactions[normalTransaction1].memo).toBe("test memo");
      expect(result.transactions[transferTransaction1].memo).toBe("test memo");
      expect(result.transactions[transferTransaction2].memo).toBe("test memo");

      expect(result.transactions[normalTransaction2].memo).toBe("");
    });
  });
  describe("category", () => {
    it("updates the category of selected normal transactions", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1],
        updates: { categoryId: category2 },
      });

      expect(result.transactions[normalTransaction1].categoryId).toBe(
        category2
      );
      expect(result.transactions[normalTransaction2].categoryId).toBe(
        category1
      );
    });

    it("does not update the category of transfer transactions", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [transferTransaction1],
        updates: { categoryId: category2 },
      });

      expect(result.transactions[transferTransaction1]).toMatchObject({
        type: "transfer",
        memo: "",
      });
    });

    it("updates multiple selected normal transactions", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1, normalTransaction2],
        updates: { categoryId: category2 },
      });

      expect(result.transactions[normalTransaction1].categoryId).toBe(
        category2
      );
      expect(result.transactions[normalTransaction2].categoryId).toBe(
        category2
      );
    });
  });

  describe("account", () => {
    it("moves a normal transaction and adjusts both account balances", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1],
        updates: { accountId: account2 },
      });

      expect(result.transactions[normalTransaction1].accountId).toBe(account2);
      expect(result.accounts[account1].balance).toBe(1100);
      expect(result.accounts[account2].balance).toBe(400);
    });

    it("adjusts balances correctly when moving an inflow transaction", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction2],
        updates: { accountId: account2 },
      });

      expect(result.transactions[normalTransaction2].accountId).toBe(account2);
      expect(result.accounts[account1].balance).toBe(800);
      expect(result.accounts[account2].balance).toBe(700);
    });

    it("moves multiple selected transactions and adjusts account balances", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1, normalTransaction2],
        updates: { accountId: account2 },
      });

      expect(result.transactions[normalTransaction1].accountId).toBe(account2);
      expect(result.transactions[normalTransaction2].accountId).toBe(account2);
      expect(result.accounts[account1].balance).toBe(900);
      expect(result.accounts[account2].balance).toBe(600);
    });

    it("does not change balances when moving a transaction to its current account", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [normalTransaction1],
        updates: { accountId: account1 },
      });

      expect(result.transactions[normalTransaction1].accountId).toBe(account1);
      expect(result.accounts[account1].balance).toBe(1000);
      expect(result.accounts[account2].balance).toBe(500);
    });
    it("updates the counterpart transfer account when moving only one side", () => {
      const result = editBulkTransactions(createSnapshot(), {
        transactionIds: [transferTransaction1],
        updates: { accountId: account3 },
      });

      expect(result.transactions[transferTransaction1].accountId).toBe(
        account3
      );
      expect(result.transactions[transferTransaction2].accountId).toBe(
        account2
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
  });
});
