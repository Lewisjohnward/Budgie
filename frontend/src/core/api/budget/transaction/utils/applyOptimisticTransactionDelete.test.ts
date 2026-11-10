import { describe, it, expect } from "vitest";
import { produce } from "immer";
import {
  applyOptimisticTransactionsDelete,
  TransactionDeleteDraft,
} from "./applyOptimisticTransactionDelete";
import {
  TransactionId,
  asAccountId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";

const account1 = asAccountId("account1");
const account2 = asAccountId("account2");
const missingAccount = asAccountId("missing-account");

const transaction1 = asTransactionId("transaction1");
const transaction2 = asTransactionId("transaction2");
const transaction3 = asTransactionId("transaction3");
const nonexistent = asTransactionId("nonexistent");

describe("applyOptimisticTransactionDelete", () => {
  const createSnapshot = (): TransactionDeleteDraft => ({
    accounts: {
      [account1]: {
        balance: 1000,
      },
      [account2]: {
        balance: 500,
      },
    },
    transactions: {
      [transaction1]: {
        id: transaction1,
        accountId: account1,
        type: "normal",
        inflow: 0,
        outflow: 100,
      },
      [transaction2]: {
        id: transaction2,
        accountId: account1,
        type: "normal",
        inflow: 200,
        outflow: 0,
      },
    },
  });

  const deleteTransactions = (
    snapshot: TransactionDeleteDraft,
    ids: TransactionId[]
  ): TransactionDeleteDraft =>
    produce(snapshot, (draft) => {
      applyOptimisticTransactionsDelete(draft, ids);
    });

  it("deletes a transaction", () => {
    const result = deleteTransactions(createSnapshot(), [transaction1]);

    expect(result.transactions[transaction1]).toBeUndefined();
    expect(result.transactions[transaction2]).toBeDefined();
  });

  it("updates the account balance when deleting an expense", () => {
    const result = deleteTransactions(createSnapshot(), [transaction1]);

    expect(result.accounts[account1].balance).toBe(1100);
  });

  it("updates the account balance when deleting an income", () => {
    const result = deleteTransactions(createSnapshot(), [transaction2]);

    expect(result.accounts[account1].balance).toBe(800);
  });

  it("deletes multiple transactions", () => {
    const result = deleteTransactions(createSnapshot(), [
      transaction1,
      transaction2,
    ]);

    expect(result.transactions[transaction1]).toBeUndefined();
    expect(result.transactions[transaction2]).toBeUndefined();
    expect(result.accounts[account1].balance).toBe(900);
  });

  it("does not modify the original snapshot", () => {
    const snapshot = createSnapshot();

    deleteTransactions(snapshot, [transaction1]);

    expect(snapshot.transactions[transaction1]).toBeDefined();
    expect(snapshot.accounts[account1].balance).toBe(1000);
  });

  it("ignores transaction IDs that do not exist", () => {
    const snapshot = createSnapshot();

    const result = deleteTransactions(snapshot, [nonexistent]);

    expect(result).toEqual(snapshot);
  });

  it("does not change balances when transaction IDs do not exist", () => {
    const result = deleteTransactions(createSnapshot(), [nonexistent]);

    expect(result.accounts[account1].balance).toBe(1000);
    expect(result.accounts[account2].balance).toBe(500);
  });

  it("handles duplicate transaction IDs", () => {
    const result = deleteTransactions(createSnapshot(), [
      transaction1,
      transaction1,
    ]);

    expect(result.transactions[transaction1]).toBeUndefined();
    expect(result.accounts[account1].balance).toBe(1100);
  });

  it("updates balances across multiple accounts", () => {
    const snapshot = createSnapshot();

    snapshot.transactions[transaction3] = {
      id: transaction3,
      accountId: account2,
      type: "normal",
      inflow: 0,
      outflow: 50,
    };

    const result = deleteTransactions(snapshot, [transaction1, transaction3]);

    expect(result.accounts[account1].balance).toBe(1100);
    expect(result.accounts[account2].balance).toBe(550);
  });

  it("throws when a transaction references a missing account", () => {
    const snapshot = createSnapshot();

    snapshot.transactions[transaction1].accountId = missingAccount;

    expect(() => deleteTransactions(snapshot, [transaction1])).toThrow(
      `Account not found: ${missingAccount}`
    );
  });

  it("does not mutate balances when deleting an empty list", () => {
    const snapshot = createSnapshot();

    const result = deleteTransactions(snapshot, []);

    expect(result).toEqual(snapshot);
  });
  it("deletes both sides of a transfer", () => {
    const transferTransaction = asTransactionId("transfer1");
    const counterpartTransaction = asTransactionId("transfer2");

    const snapshot = createSnapshot();

    snapshot.transactions[transferTransaction] = {
      id: transferTransaction,
      accountId: account1,
      type: "transfer",
      inflow: 0,
      outflow: 100,
      transferTransactionId: counterpartTransaction,
    };

    snapshot.transactions[counterpartTransaction] = {
      id: counterpartTransaction,
      accountId: account2,
      type: "transfer",
      inflow: 100,
      outflow: 0,
      transferTransactionId: transferTransaction,
    };

    const result = deleteTransactions(snapshot, [transferTransaction]);

    expect(result.transactions[transferTransaction]).toBeUndefined();
    expect(result.transactions[counterpartTransaction]).toBeUndefined();

    expect(result.accounts[account1].balance).toBe(1100);
    expect(result.accounts[account2].balance).toBe(400);
  });
  it("deletes both sides when deleting the counterpart directly", () => {
    const transferTransaction = asTransactionId("transfer1");
    const counterpartTransaction = asTransactionId("transfer2");

    const snapshot = createSnapshot();

    snapshot.transactions[transferTransaction] = {
      id: transferTransaction,
      accountId: account1,
      type: "transfer",
      inflow: 0,
      outflow: 100,
      transferTransactionId: counterpartTransaction,
    };

    snapshot.transactions[counterpartTransaction] = {
      id: counterpartTransaction,
      accountId: account2,
      type: "transfer",
      inflow: 100,
      outflow: 0,
      transferTransactionId: transferTransaction,
    };

    const result = deleteTransactions(snapshot, [counterpartTransaction]);

    expect(result.transactions[transferTransaction]).toBeUndefined();
    expect(result.transactions[counterpartTransaction]).toBeUndefined();
  });
});
