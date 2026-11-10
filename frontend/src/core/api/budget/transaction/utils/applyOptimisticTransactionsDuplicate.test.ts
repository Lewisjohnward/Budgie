import { describe, it, expect } from "vitest";
import { produce } from "immer";
import {
  applyOptimisticTransactionsDuplicate,
  TransactionDuplicateDraft,
} from "./applyOptimisticTransactionsDuplicate";
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

const transferTransaction1 = asTransactionId("transfer1");
const transferTransaction2 = asTransactionId("transfer2");

describe("applyOptimisticTransactionsDuplicate", () => {
  const createSnapshot = (): TransactionDuplicateDraft => ({
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
        memo: "test",
      },
      [transaction2]: {
        id: transaction2,
        accountId: account1,
        type: "normal",
        inflow: 200,
        outflow: 0,
        memo: "test",
      },
      [transferTransaction1]: {
        id: transferTransaction1,
        accountId: account1,
        type: "transfer",
        inflow: 0,
        outflow: 100,
        transferTransactionId: transferTransaction2,
        transferAccountId: account2,
        memo: "test transfer",
      },
      [transferTransaction2]: {
        id: transferTransaction2,
        accountId: account2,
        type: "transfer",
        inflow: 100,
        outflow: 0,
        transferTransactionId: transferTransaction1,
        transferAccountId: account1,
        memo: "test transfer",
      },
    },
  });

  const duplicateTransactions = (
    snapshot: TransactionDuplicateDraft,
    ids: TransactionId[]
  ): {
    snapshot: TransactionDuplicateDraft;
    optimisticIds: TransactionId[];
  } => {
    let optimisticIds: TransactionId[] = [];

    const result = produce(snapshot, (draft) => {
      optimisticIds = applyOptimisticTransactionsDuplicate(draft, ids);
    });

    return {
      snapshot: result,
      optimisticIds,
    };
  };

  it("duplicates a normal transaction", () => {
    const { snapshot, optimisticIds } = duplicateTransactions(
      createSnapshot(),
      [transaction1]
    );

    expect(optimisticIds).toHaveLength(1);

    expect(snapshot.transactions[optimisticIds[0]]).toMatchObject({
      accountId: account1,
      type: "normal",
      inflow: 0,
      outflow: 100,
    });
  });

  it("updates the account balance when duplicating an expense", () => {
    const { snapshot } = duplicateTransactions(createSnapshot(), [
      transaction1,
    ]);

    expect(snapshot.accounts[account1].balance).toBe(900);
  });

  it("updates the account balance when duplicating income", () => {
    const { snapshot } = duplicateTransactions(createSnapshot(), [
      transaction2,
    ]);

    expect(snapshot.accounts[account1].balance).toBe(1200);
  });

  it("duplicates multiple transactions", () => {
    const { snapshot, optimisticIds } = duplicateTransactions(
      createSnapshot(),
      [transaction1, transaction2]
    );

    expect(optimisticIds).toHaveLength(2);
    expect(snapshot.accounts[account1].balance).toBe(1100);
  });

  it("does not modify the original snapshot", () => {
    const snapshot = createSnapshot();

    const originalTransactionCount = Object.keys(snapshot.transactions).length;

    const originalBalance = snapshot.accounts[account1].balance;

    duplicateTransactions(snapshot, [transaction1]);

    expect(Object.keys(snapshot.transactions)).toHaveLength(
      originalTransactionCount
    );
    expect(snapshot.accounts[account1].balance).toBe(originalBalance);
  });

  it("ignores transaction IDs that do not exist", () => {
    const { snapshot, optimisticIds } = duplicateTransactions(
      createSnapshot(),
      [nonexistent]
    );

    expect(optimisticIds).toHaveLength(0);
    expect(Object.keys(snapshot.transactions)).toHaveLength(4);
  });

  it("does not change balances when transaction IDs do not exist", () => {
    const { snapshot } = duplicateTransactions(createSnapshot(), [nonexistent]);

    expect(snapshot.accounts[account1].balance).toBe(1000);
    expect(snapshot.accounts[account2].balance).toBe(500);
  });

  it("handles duplicate transaction IDs", () => {
    const { snapshot, optimisticIds } = duplicateTransactions(
      createSnapshot(),
      [transaction1, transaction1]
    );

    expect(optimisticIds).toHaveLength(1);
    expect(snapshot.accounts[account1].balance).toBe(900);
  });

  it("updates balances across multiple accounts", () => {
    const initialSnapshot = createSnapshot();

    initialSnapshot.transactions[transaction3] = {
      id: transaction3,
      accountId: account2,
      type: "normal",
      inflow: 0,
      outflow: 50,
    };

    const { snapshot, optimisticIds } = duplicateTransactions(initialSnapshot, [
      transaction1,
      transaction3,
    ]);

    expect(optimisticIds).toHaveLength(2);
    expect(snapshot.accounts[account1].balance).toBe(900);
    expect(snapshot.accounts[account2].balance).toBe(450);
  });

  it("handles transactions whose account no longer exists", () => {
    const initialSnapshot = createSnapshot();

    initialSnapshot.transactions[transaction1].accountId = missingAccount;

    const { snapshot, optimisticIds } = duplicateTransactions(initialSnapshot, [
      transaction1,
    ]);

    expect(optimisticIds).toHaveLength(1);
    expect(snapshot.accounts[account1].balance).toBe(1000);
    expect(snapshot.accounts[account2].balance).toBe(500);
  });

  it("does not change balances when duplicating an empty list", () => {
    const { snapshot, optimisticIds } = duplicateTransactions(
      createSnapshot(),
      []
    );

    expect(optimisticIds).toHaveLength(0);
    expect(snapshot.accounts[account1].balance).toBe(1000);
    expect(snapshot.accounts[account2].balance).toBe(500);
  });

  it("duplicates both sides of a transfer", () => {
    const initialSnapshot = createSnapshot();

    const { snapshot, optimisticIds } = duplicateTransactions(initialSnapshot, [
      transferTransaction1,
    ]);

    expect(optimisticIds).toHaveLength(2);

    const duplicatedTransactions = optimisticIds.map(
      (id) => snapshot.transactions[id]
    );

    expect(duplicatedTransactions).toHaveLength(2);

    const duplicatedSource = duplicatedTransactions.find(
      (transaction) => transaction.accountId === account1
    );

    const duplicatedDestination = duplicatedTransactions.find(
      (transaction) => transaction.accountId === account2
    );

    expect(duplicatedSource).toBeDefined();
    expect(duplicatedDestination).toBeDefined();

    expect(duplicatedSource).toMatchObject({
      type: "transfer",
      inflow: 0,
      outflow: 100,
    });

    expect(duplicatedDestination).toMatchObject({
      type: "transfer",
      inflow: 100,
      outflow: 0,
    });

    if (
      duplicatedSource?.type === "transfer" &&
      duplicatedDestination?.type === "transfer"
    ) {
      expect(duplicatedSource.transferTransactionId).toBe(
        duplicatedDestination.id
      );

      expect(duplicatedDestination.transferTransactionId).toBe(
        duplicatedSource.id
      );
    }

    expect(snapshot.accounts[account1].balance).toBe(900);
    expect(snapshot.accounts[account2].balance).toBe(600);
  });

  it("duplicates a transfer pair only once when both sides are selected", () => {
    const initialSnapshot = createSnapshot();

    const { optimisticIds } = duplicateTransactions(initialSnapshot, [
      transferTransaction1,
      transferTransaction2,
    ]);

    expect(optimisticIds).toHaveLength(2);
  });

  it("does not duplicate an incomplete transfer pair", () => {
    const initialSnapshot = createSnapshot();

    delete initialSnapshot.transactions[transferTransaction2];

    const { snapshot, optimisticIds } = duplicateTransactions(initialSnapshot, [
      transferTransaction1,
    ]);

    expect(optimisticIds).toHaveLength(0);
    expect(snapshot.accounts[account1].balance).toBe(1000);
    expect(snapshot.transactions[transferTransaction1]).toBeDefined();
  });
});
