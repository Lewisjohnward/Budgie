import { PrismaClient } from "@prisma/client";
import { AccountPayload } from "../../../dto";

const prisma = new PrismaClient();

export const createAccount = async (account: AccountPayload) => {
  return await prisma.account.create({
    data: {
      ...account,
      balance: 0,
    },
  });
};
