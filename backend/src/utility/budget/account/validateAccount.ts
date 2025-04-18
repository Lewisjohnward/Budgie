import { PrismaClient } from "@prisma/client";
import { accountSchema } from "../../../schemas";

const prisma = new PrismaClient();

export const isValidAccount = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  });

  if (account === null) {
    // TODO: NEEDS TESTING
    throw new Error("Invalid account");
  }

  return account;
};

export const validateAccount = ({
  userId,
  name,
  type,
  balance,
}: {
  userId: string;
  name: string;
  type: string;
  balance: number;
}) => {
  return accountSchema.parse({ userId, name, type, balance });
};
