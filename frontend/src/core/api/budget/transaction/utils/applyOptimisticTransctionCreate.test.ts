import { describe, it, expect } from "vitest";
import { produce } from "immer";
import {
  asAccountId,
  asCategoryId,
  asPayeeId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import type { TransactionId } from "@/pages/budget/allocation/types/types";
import type { CreateTransactionInput } from "../types";
import {
  applyOptimisticTransactionCreate,
  TransactionCreateDraft,
} from "./applyOptimisticTransctionCreate";

const account1 = asAccountId("account1");
const account2 = asAccountId("account2");

const transaction1 = asTransactionId("transaction1");
const transaction2 = asTransactionId("transaction2");

const uncategorisedCategoryId = asCategoryId("uncategorisedCategoryId");
const userPayeeDefaultCategoryId = asCategoryId("userCategoryId");
const userCategoryId = asCategoryId("userCategoryId");

const payee1 = asPayeeId("payee");

describe("applyOptimisticTransactionCreate", () => {
  const createSnapshot = (): TransactionCreateDraft => ({
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
        categoryId: uncategorisedCategoryId,
        payeeId: null,
        date: "2026-01-01",
        memo: "Transaction 1",
        inflow: 0,
        outflow: 100,
      },
      [transaction2]: {
        id: transaction2,
        accountId: account1,
        type: "normal",
        categoryId: uncategorisedCategoryId,
        payeeId: null,
        date: "2026-01-02",
        memo: "Transaction 2",
        inflow: 200,
        outflow: 0,
      },
    },
    categories: {
      uncategorised: {
        id: uncategorisedCategoryId,
      },
    },
    payees: {
      [payee1]: {
        id: payee1,
        automaticallyCategorisePayee: false,
        defaultCategoryId: null,
      },
    },
  });

  const createTransaction = (
    input: CreateTransactionInput,
    initialSnapshot = createSnapshot()
  ) => {
    let optimisticIds: TransactionId[] = [];

    const snapshot = produce(
      initialSnapshot,
      (draft: TransactionCreateDraft) => {
        optimisticIds = applyOptimisticTransactionCreate(draft, input);
      }
    );

    return { snapshot, optimisticIds };
  };

  it("creates a normal transaction", () => {
    const { snapshot, optimisticIds } = createTransaction({
      accountId: account1,
      inflow: "0",
      outflow: "100",
      date: "2026-01-01",
      memo: "Groceries",
    });

    expect(optimisticIds).toHaveLength(1);

    const transactionId = optimisticIds[0];
    const transaction = snapshot.transactions[transactionId];

    expect(transaction).toMatchObject({
      id: transactionId,
      type: "normal",
      accountId: account1,
      inflow: 0,
      outflow: 100,
      date: "2026-01-01",
      memo: "Groceries",
      payeeId: null,
    });

    expect(snapshot.accounts[account1].balance).toBe(900);
  });

  it("uses the uncategorised category by default", () => {
    const { snapshot, optimisticIds } = createTransaction({
      accountId: account1,
      inflow: "0",
      outflow: "50",
    });

    const transaction = snapshot.transactions[optimisticIds[0]];

    expect(transaction).toMatchObject({
      type: "normal",
      categoryId: snapshot.categories.uncategorised.id,
      memo: "",
    });
  });

  it("uses the payee's default category when automatically categorising", () => {
    const initialSnapshot = createSnapshot();

    const payee = initialSnapshot.payees[payee1];

    payee.automaticallyCategorisePayee = true;
    payee.defaultCategoryId = userPayeeDefaultCategoryId;

    const { snapshot, optimisticIds } = createTransaction(
      {
        accountId: account1,
        inflow: "0",
        outflow: "50",
        payeeId: payee.id,
      },
      initialSnapshot
    );

    const transaction = snapshot.transactions[optimisticIds[0]];

    expect(transaction).toMatchObject({
      type: "normal",
      categoryId: payee.defaultCategoryId,
      payeeId: payee.id,
    });
  });

  it("prioritises an explicitly supplied category over the payee's default category", () => {
    const initialSnapshot = createSnapshot();

    const payee = initialSnapshot.payees[payee1];

    payee.automaticallyCategorisePayee = true;
    payee.defaultCategoryId = userCategoryId;

    const { snapshot, optimisticIds } = createTransaction(
      {
        accountId: account1,
        inflow: "0",
        outflow: "50",
        payeeId: payee.id,
        categoryId: userCategoryId,
      },
      initialSnapshot
    );

    const transaction = snapshot.transactions[optimisticIds[0]];

    expect(transaction.type).toBe("normal");
    if (transaction.type === "normal") {
      expect(transaction.categoryId).toBe(userCategoryId);
    }
  });

  it("updates the account balance for an inflow", () => {
    const { snapshot } = createTransaction({
      accountId: account1,
      inflow: "200",
      outflow: "0",
    });

    expect(snapshot.accounts[account1].balance).toBe(1200);
  });

  it("updates the account balance for an outflow", () => {
    const { snapshot } = createTransaction({
      accountId: account1,
      inflow: "0",
      outflow: "200",
    });

    expect(snapshot.accounts[account1].balance).toBe(800);
  });

  it("creates a transfer pair with linked transaction IDs", () => {
    const { snapshot, optimisticIds } = createTransaction({
      accountId: account1,
      transferAccountId: account2,
      inflow: "0",
      outflow: "100",
      date: "2026-01-01",
      memo: "Moving money",
    });

    expect(optimisticIds).toHaveLength(2);

    const [sourceId, destinationId] = optimisticIds;

    expect(sourceId).not.toBe(destinationId);

    expect(snapshot.transactions[sourceId]).toMatchObject({
      id: sourceId,
      type: "transfer",
      accountId: account1,
      transferAccountId: account2,
      transferTransactionId: destinationId,
      inflow: 0,
      outflow: 100,
      memo: "Moving money",
    });

    expect(snapshot.transactions[destinationId]).toMatchObject({
      id: destinationId,
      type: "transfer",
      accountId: account2,
      transferAccountId: account1,
      transferTransactionId: sourceId,
      inflow: 100,
      outflow: 0,
      memo: "Moving money",
    });
  });

  it("updates both account balances when creating a transfer", () => {
    const { snapshot } = createTransaction({
      accountId: account1,
      transferAccountId: account2,
      inflow: "0",
      outflow: "100",
    });

    expect(snapshot.accounts[account1].balance).toBe(900);
    expect(snapshot.accounts[account2].balance).toBe(600);
  });

  it("reverses inflow and outflow on the destination transaction", () => {
    const { snapshot, optimisticIds } = createTransaction({
      accountId: account1,
      transferAccountId: account2,
      inflow: "25",
      outflow: "100",
    });

    const destination = snapshot.transactions[optimisticIds[1]];

    expect(destination).toMatchObject({
      inflow: 100,
      outflow: 25,
    });
  });

  it("does not update a missing source account balance", () => {
    const missingAccountId = asAccountId("missing-account");

    const { snapshot, optimisticIds } = createTransaction({
      accountId: missingAccountId,
      inflow: "100",
      outflow: "0",
    });

    expect(optimisticIds).toHaveLength(1);
    expect(snapshot.transactions[optimisticIds[0]]).toBeDefined();
  });

  it("does not update a missing destination account balance", () => {
    const missingAccountId = asAccountId("missing-account");

    const { snapshot, optimisticIds } = createTransaction({
      accountId: account1,
      transferAccountId: missingAccountId,
      inflow: "0",
      outflow: "100",
    });

    expect(snapshot.accounts[account1].balance).toBe(900);
    expect(optimisticIds).toHaveLength(2);

    expect(snapshot.transactions[optimisticIds[0]]).toBeDefined();
    expect(snapshot.transactions[optimisticIds[1]]).toBeDefined();
  });

  it("does not mutate the original snapshot", () => {
    const originalSnapshot = createSnapshot();

    const result = produce(originalSnapshot, (draft) => {
      applyOptimisticTransactionCreate(draft, {
        accountId: account1,
        inflow: "0",
        outflow: "100",
      });
    });

    expect(originalSnapshot.accounts[account1].balance).toBe(1000);

    expect(Object.keys(originalSnapshot.transactions)).toHaveLength(
      Object.keys(result.transactions).length - 1
    );

    expect(result.accounts[account1].balance).toBe(900);
  });
});
