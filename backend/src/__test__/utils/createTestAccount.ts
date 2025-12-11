import request from "supertest";
import app from "../../app";
import { prisma } from "../../shared/prisma/client";

export const createTestAccount = async (
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
