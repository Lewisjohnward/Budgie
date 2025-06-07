import { prisma } from "../../../../shared/prisma/client";
import { accountSchema } from "../../../../shared/schemas";
import { Decimal } from "@prisma/client/runtime/library";

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
  balance: Decimal;
}) => {
  return accountSchema.parse({ userId, name, type, balance });
};
