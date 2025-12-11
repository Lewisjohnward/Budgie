import { prisma } from "../../../../../shared/prisma/client";
// TODO: I THINK THIS NEEDS TO BE MADE INTO ACCOUNT, TRANSACTION, CATEGORY, CATEGORY GROUP, MONTHS, SO THAT WHEN UPDATING FROM FE, THE FE ONLY HAS TO FETCH WHAT HAS CHANGED, INSTEAD OF FETCHING EVERYTHING

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
        orderBy: {
          date: "asc",
        },
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
