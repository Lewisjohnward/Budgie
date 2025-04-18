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

  const accounts = accountsWithTransactions.map((account) => ({
    ...account,
    balance: convertDecimalToNumber(account.balance),
    transactions: account.transactions.map((transaction) => ({
      ...transaction,
      inflow: convertDecimalToNumber(transaction.inflow),
      outflow: convertDecimalToNumber(transaction.outflow),
    })),
  }));

  return accounts;
};
