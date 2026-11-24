import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { asAccountId } from "@/pages/budget/allocation/types/types";
import type { AccountId } from "@/pages/budget/allocation/types/types";
import type { CreateAccountInput } from "../types";
import {
  applyOptimisticAccountCreate,
  AccountCreateDraft,
} from "./applyOptimisticAccountCreate";

const account1 = asAccountId("account1");
const account2 = asAccountId("account2");

describe("applyOptimisticAccountCreate", () => {
  const createSnapshot = (): AccountCreateDraft => ({
    accounts: {
      [account1]: {
        id: account1,
        name: "Natwest",
        position: 0,
        balance: 1000,
        type: "BANK",
        open: true,
        deletable: true,
      },
      [account2]: {
        id: account2,
        name: "Santander",
        position: 1,
        balance: -500,
        type: "BANK",
        open: true,
        deletable: true,
      },
    },
  });

  const createAccount = (
    input: CreateAccountInput,
    initialSnapshot = createSnapshot()
  ) => {
    let optimisticAccountId: AccountId;

    const snapshot = produce(initialSnapshot, (draft: AccountCreateDraft) => {
      optimisticAccountId = applyOptimisticAccountCreate(draft, input);
    });

    return { snapshot, optimisticAccountId: optimisticAccountId! };
  };

  it("creates an account", () => {
    const { snapshot, optimisticAccountId } = createAccount({
      name: "Monzo",
      type: "BANK",
      balance: 250,
    });

    const account = snapshot.accounts[optimisticAccountId];

    expect(account).toMatchObject({
      id: optimisticAccountId,
      name: "Monzo",
      position: 2,
      balance: 250,
      type: "BANK",
      open: true,
      deletable: true,
    });
  });

  it("returns a unique account ID", () => {
    const { optimisticAccountId } = createAccount({
      name: "Monzo",
      type: "BANK",
      balance: 100,
    });

    expect(optimisticAccountId).toBeDefined();
    expect(optimisticAccountId).not.toBe(account1);
    expect(optimisticAccountId).not.toBe(account2);
  });

  it("trims the account name", () => {
    const { snapshot, optimisticAccountId } = createAccount({
      name: "  Monzo  ",
      type: "BANK",
      balance: 100,
    });

    expect(snapshot.accounts[optimisticAccountId].name).toBe("Monzo");
  });

  it("preserves a negative initial balance", () => {
    const { snapshot, optimisticAccountId } = createAccount({
      name: "Credit Card",
      type: "CREDIT_CARD",
      balance: -250,
    });

    expect(snapshot.accounts[optimisticAccountId].balance).toBe(-250);
  });

  it("assigns the next available position", () => {
    const initialSnapshot = createSnapshot();

    initialSnapshot.accounts[account2].position = 5;

    const { snapshot, optimisticAccountId } = createAccount(
      {
        name: "Monzo",
        type: "BANK",
        balance: 100,
      },
      initialSnapshot
    );

    expect(snapshot.accounts[optimisticAccountId].position).toBe(6);
  });

  it("starts at position zero when no accounts exist", () => {
    const initialSnapshot: AccountCreateDraft = {
      accounts: {},
    };

    const { snapshot, optimisticAccountId } = createAccount(
      {
        name: "Monzo",
        type: "BANK",
        balance: 100,
      },
      initialSnapshot
    );

    expect(snapshot.accounts[optimisticAccountId].position).toBe(0);
  });

  it("does not mutate the original snapshot", () => {
    const originalSnapshot = createSnapshot();

    const result = produce(originalSnapshot, (draft) => {
      applyOptimisticAccountCreate(draft, {
        name: "Monzo",
        type: "BANK",
        balance: 100,
      });
    });

    expect(Object.keys(originalSnapshot.accounts)).toHaveLength(2);
    expect(Object.keys(result.accounts)).toHaveLength(3);

    expect(originalSnapshot.accounts[account1].balance).toBe(1000);
    expect(originalSnapshot.accounts[account2].balance).toBe(-500);
  });

  it("does not modify existing accounts", () => {
    const initialSnapshot = createSnapshot();

    const originalAccount1 = { ...initialSnapshot.accounts[account1] };
    const originalAccount2 = { ...initialSnapshot.accounts[account2] };

    const { snapshot } = createAccount(
      {
        name: "Monzo",
        type: "BANK",
        balance: 100,
      },
      initialSnapshot
    );

    expect(snapshot.accounts[account1]).toEqual(originalAccount1);
    expect(snapshot.accounts[account2]).toEqual(originalAccount2);
  });
});
