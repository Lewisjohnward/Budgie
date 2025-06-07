import { prisma } from "../../../../shared/prisma/client";

export const userOwnsAccount = async (accountId: string, userId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId: userId,
    },
  });

  if (!account) {
    throw new Error("Unable to add transaction");
  }
};
