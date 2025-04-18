import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";
import { roundToStartOfMonth } from "../helpers/roundToStartOfMonth";

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

  const account = await prisma.account.findFirstOrThrow({
    where: {
      id: transactionsToDelete[0].accountId,
    },
  });

  const balance = convertDecimalToNumber(account.balance);
  const changeInBalance = transactionsToDelete.reduce(
    (accumulator, { inflow, outflow }) => {
      return (
        accumulator +
        convertDecimalToNumber(outflow) -
        convertDecimalToNumber(inflow)
      );
    },
    0,
  );

  console.log("to delete", transactionsToDelete);

  const testTransactionsRoundedToStartOfMonth = transactionsToDelete.map(
    (transaction) => ({
      ...transaction,
      date: roundToStartOfMonth(transaction.date),
      changeInBalance:
        convertDecimalToNumber(transaction.outflow) -
        convertDecimalToNumber(transaction.inflow),
    }),
  );

  console.log(
    "test months rounded to start",
    testTransactionsRoundedToStartOfMonth,
  );

  await Promise.all(
    testTransactionsRoundedToStartOfMonth.map(
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

    await tx.account.update({
      where: { id: transactionsToDelete[0].accountId },
      data: { balance: balance + changeInBalance },
    });
  });
};
