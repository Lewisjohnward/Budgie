import request from "supertest";
import app from "../../app";
import { prisma } from "../../shared/prisma/client";

export const createTestAccount = async (
  cookie: string,
  balance: number | undefined = 0,
) => {
  const testAccount = {
    name: "test account",
    type: "BANK",
    balance: balance,
  };

  await request(app)
    .post("/budget/account")
    .set("Authorization", `Bearer ${cookie}`)
    .send(testAccount);

  const account = await prisma.account.findFirstOrThrow({
    where: {
      name: testAccount.name,
    },
  });

  return account;
};
