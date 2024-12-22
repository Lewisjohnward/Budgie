import { PrismaClient } from "@prisma/client";

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

export const validateCategoryAccountId = async (
  accountId: string,
  categoryId: string,
  userId: string,
) => {
  const [account, category] = await prisma.$transaction([
    prisma.account.findUnique({
      where: {
        id: accountId,
        userId: userId,
      },
    }),
    prisma.category.findUnique({
      where: {
        id: categoryId,
        userId: userId,
      },
    }),
  ]);

  if (!account || !category) {
    throw new Error("Unable to add transaction");
  }

  return [account, category];
};
