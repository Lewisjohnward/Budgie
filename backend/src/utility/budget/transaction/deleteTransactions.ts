import { PrismaClient } from "@prisma/client";
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

  if (transactionsToDelete.length === 0) return;

  const readyToAssignCategory = await prisma.category.findFirstOrThrow({
    where: {
      name: "Ready to Assign",
      userId,
    },
  });

  const readyToAssignId = readyToAssignCategory.id;

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
  const readyToAssignTransactions = transactionsRoundedToStartOfMonth.filter(
    (transaction) => transaction.categoryId === readyToAssignId,
  );
  const otherTransactions = transactionsRoundedToStartOfMonth.filter(
    (transaction) => transaction.categoryId !== readyToAssignId,
  );

  await prisma.$transaction(async (tx) => {
    await Promise.all(
      readyToAssignTransactions.map((transaction) =>
        tx.month.updateMany({
          where: {
            categoryId: readyToAssignId,
            month: {
              gte: transaction.date,
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

    await Promise.all(
      otherTransactions.map((transaction) =>
        tx.month.update({
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
