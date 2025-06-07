import { prisma } from "../../../../shared/prisma/client";

export const selectAccounts = async (userId: string) => {
  const accountsWithTransactions = await prisma.account.findMany({
    where: {
      userId,
    },
    orderBy: {
      position: "asc",
    },
    include: {
      transactions: {
        include: {
          category: {
            include: {
              categoryGroup: true,
            },
          },
        },
      },
    },
  });

  return accountsWithTransactions;
};
