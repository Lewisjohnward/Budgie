import request from "supertest";
import app from "../../app";
import { AddAccountInput } from "../../features/budget/account/account.schema";
import { getAccounts } from "./getData";
import { prisma } from "../../shared/prisma/client";

/**
 * Input type for creating accounts in tests,
 * without the `userId` field.
 */
export type TestCreateAccountInputWithoutUserId = Omit<
  AddAccountInput,
  "userId"
>;

const createAccountEndpoint = "/budget/account";

export const toggleCloseAccount = async (cookie: string, accountId: string) => {
  const res = await request(app)
    .patch(`/budget/account/${accountId}/close`)
    .set("Authorization", `Bearer ${cookie}`);

  return res;
};

export const deleteAccount = async (cookie: string, accountId: string) => {
  const res = await request(app)
    .delete(`/budget/account/${accountId}`)
    .set("Authorization", `Bearer ${cookie}`);

  return res;
};

export async function fetchAccountByName(cookie: string, name: string) {
  const { accounts } = await getAccounts(cookie);

  const account = Object.values(accounts).find((a) => a.name === name);

  if (!account) {
    throw new Error(`Account ${name} not found in test`);
  }

  return account;
}

export async function fetchAccounts(cookie: string) {
  const { accounts } = await getAccounts(cookie);
  const accountsArray = Object.values(accounts);

  return accountsArray;
}

export async function createAccount(
  cookie: string,
  overrides?: Partial<TestCreateAccountInputWithoutUserId>
) {
  const accountData: TestCreateAccountInputWithoutUserId = {
    name: "test account",
    type: "BANK",
    balance: 100,
    ...overrides,
  };

  const res = await request(app)
    .post(createAccountEndpoint)
    .set("Authorization", `Bearer ${cookie}`)
    .send(accountData);

  if (res.status !== 200) {
    throw new Error("Failed to create test account");
  }

  return accountData;
}

export const createAccountAndFetch = async (
  cookie: string,
  balance: number = 0,
  name?: string
) => {
  // Use provided name or generate unique name with timestamp and random suffix
  const uniqueName =
    name ??
    `test-account-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const testAccount = {
    name: uniqueName,
    type: "BANK",
    balance: balance,
  };

  await request(app)
    .post("/budget/account")
    .set("Authorization", `Bearer ${cookie}`)
    .send(testAccount);

  // Find the account by unique name - guaranteed to be the one we just created
  const account = await prisma.account.findFirstOrThrow({
    where: {
      name: uniqueName,
    },
  });

  return account;
};

export const editAccount = async (
  cookie: string,
  accountId: string,
  // TODO:(lewis 2026-03-23 16:15) this needs better typing
  payload: { balance?: string; name?: string }
) => {
  const res = await request(app)
    .patch(`/budget/account/${accountId}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res;
};
