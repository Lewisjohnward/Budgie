import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";

const prisma = new PrismaClient();

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
