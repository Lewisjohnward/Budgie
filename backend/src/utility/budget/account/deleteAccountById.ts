import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteAccountById = async (accountId: string, userId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      accountId,
      account: {
        userId,
      },
    },
  });

  if (transaction != null) {
    throw new Error("Account has transactions, unable to delete");
  }

  await prisma.$transaction(async (prisma) => {
    await prisma.account.delete({
      where: {
        id: accountId,
        userId: userId,
      },
    });
  });
};
