import { PrismaClient, Transaction } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";
import { roundToStartOfMonth } from "../helpers/roundToStartOfMonth";
import { calculateBalanceChange } from "../helpers/calculateBalanceChangePerAccount";

const prisma = new PrismaClient();

export const deleteTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  const transactionsToDelete = await prisma.transaction.findMany({
    where: {
      id: {
        in: transactionIds,
      },
      account: {
        userId: userId,
      },
    },
  });

  const balanceChangePerAccount = calculateBalanceChange(transactionsToDelete);

  const transactionsRoundedToStartOfMonth = transactionsToDelete.map(
    (transaction) => ({
      ...transaction,
      date: roundToStartOfMonth(transaction.date),
      changeInBalance:
        convertDecimalToNumber(transaction.outflow) -
        convertDecimalToNumber(transaction.inflow),
    }),
  );

  await Promise.all(
    transactionsRoundedToStartOfMonth.map(
      async (transaction) =>
        await prisma.month.update({
          where: {
            categoryId_month: {
              categoryId: transaction.categoryId,
              month: transaction.date,
            },
          },
          data: {
            activity: {
              increment: transaction.changeInBalance,
            },
          },
        }),
    ),
  );

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({
      where: {
        id: {
          in: transactionIds,
        },
        account: {
          userId: userId,
        },
      },
    });

    for (const accountId in balanceChangePerAccount) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChangePerAccount[accountId] },
        },
      });
    }
  });
};
