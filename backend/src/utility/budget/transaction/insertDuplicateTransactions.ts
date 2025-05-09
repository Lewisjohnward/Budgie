import { PrismaClient } from "@prisma/client";
import { roundToStartOfMonth } from "..";

const prisma = new PrismaClient();

export const insertduplicateTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      id: {
        in: transactionIds,
      },
      account: {
        userId,
      },
    },
  });

  const readyToAssignCategory = await prisma.category.findUniqueOrThrow({
    where: {
      name: "Ready to Assign",
      userId,
    },
  });

  if (transactions.length === 0) {
    throw new Error("No matching transactions found to duplicate.");
  }

  const accountBalanceUpdates = transactions.reduce(
    (acc, tx) => {
      const netChange = Number(tx.inflow ?? 0) - Number(tx.outflow ?? 0);

      if (!acc[tx.accountId]) {
        acc[tx.accountId] = { changeInBalance: 0 };
      }

      acc[tx.accountId].changeInBalance += netChange;

      return acc;
    },
    {} as Record<string, { changeInBalance: number }>,
  );

  const transactionsToInsert = transactions.map(
    ({ id, createdAt, updatedAt, ...data }) => ({
      ...data,
      memo: data.memo ? `${data.memo} (copy)` : "(copy)",
    }),
  );

  const readyToAssignTransactions = transactionsToInsert.filter(
    (transaction) => transaction.categoryId === readyToAssignCategory.id,
  );
  const otherTransactions = transactionsToInsert.filter(
    (transaction) => transaction.categoryId !== readyToAssignCategory.id,
  );

  await prisma.$transaction(async (tx) => {
    await Promise.all(
      Object.entries(accountBalanceUpdates).map(
        ([accountId, { changeInBalance }]) =>
          tx.account.update({
            where: { id: accountId },
            data: {
              balance: { increment: changeInBalance },
            },
          }),
      ),
    );

    await Promise.all(
      readyToAssignTransactions.map((transaction) =>
        tx.month.updateMany({
          where: {
            categoryId: transaction.categoryId,
            month: { gte: roundToStartOfMonth(transaction.date) },
          },
          data: {
            activity: {
              increment:
                Number(transaction.inflow) - Number(transaction.outflow),
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
              month: roundToStartOfMonth(transaction.date),
            },
          },
          data: {
            activity: {
              increment:
                Number(transaction.inflow) - Number(transaction.outflow),
            },
          },
        }),
      ),
    );

    await tx.transaction.createMany({
      data: transactionsToInsert,
      skipDuplicates: true,
    });
  });
};
