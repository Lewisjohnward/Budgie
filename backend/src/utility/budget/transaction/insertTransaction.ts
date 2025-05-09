import { PrismaClient } from "@prisma/client";
import {
  convertDecimalToNumber,
  getIntermediateMonths,
  roundToStartOfMonth,
  isAfterUtc,
} from "..";
import { toZonedTime } from "date-fns-tz";
import { TransactionPayload } from "../../../dto";

const prisma = new PrismaClient();
const MAX_MONTHS = 12;

//TODO: THIS NEEDS FIXING
export const insertTransaction = async (
  userId: string,
  transaction: TransactionPayload,
) => {
  const { accountId, inflow = 0, outflow = 0 } = transaction;
  // TODO: check that if a categoryId is given it exists to prevent bug

  const account = await prisma.account.findUniqueOrThrow({
    where: {
      id: accountId,
    },
  });

  const balanceModifier = inflow - outflow;

  const updatedBalance =
    convertDecimalToNumber(account.balance) + balanceModifier;

  const transactionDate = new Date(transaction.date!);

  const utcNow = toZonedTime(new Date(), "UTC");

  if (isAfterUtc(transactionDate, utcNow)) {
    console.log("User is trying to add a transaction in the future, rejected");
    return;
  }

  const existingMonths = await prisma.month.findMany({
    where: {
      category: {
        userId,
      },
      month: {
        lte: new Date(),
      },
    },
    select: {
      month: true,
    },
  });

  const earliestMonth = roundToStartOfMonth(
    existingMonths.reduce(
      (min, { month }) => (month < min ? month : min),
      new Date(),
    ),
  );

  const missingMonths = getIntermediateMonths(transactionDate, earliestMonth);

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true },
  });

  const recentMonths = missingMonths.slice(-MAX_MONTHS);
  const monthEntries: any[] = [];

  for (const category of categories) {
    for (const month of recentMonths) {
      monthEntries.push({
        categoryId: category.id,
        month,
        activity: 0,
        assigned: 0,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: account.id },
      data: { balance: updatedBalance },
    });
    await tx.month.createMany({
      data: monthEntries,
    });
  });

  const monthOfTransaction = roundToStartOfMonth(transactionDate);

  // UNCATEGORISED TRANSACTION
  if (!transaction.categoryId) {
    const uncategorisedCategory = await prisma.category.findUniqueOrThrow({
      where: {
        name: "Uncategorised Transactions",
      },
      include: {
        months: true,
      },
    });

    await prisma.transaction.create({
      data: {
        ...transaction,
        categoryId: uncategorisedCategory.id,
      },
    });

    const monthRecord = await prisma.month.findUnique({
      where: {
        categoryId_month: {
          categoryId: uncategorisedCategory.id,
          month: monthOfTransaction,
        },
      },
    });

    if (!monthRecord) throw new Error("There is no month in the db");

    await prisma.month.update({
      where: {
        categoryId_month: {
          categoryId: uncategorisedCategory.id,
          month: monthOfTransaction,
        },
      },
      data: {
        activity:
          convertDecimalToNumber(monthRecord.activity) + balanceModifier,
      },
    });
    return;
  }

  // READY TO ASSIGN TRANSACTION
  const readyToAssignCategory = await prisma.category.findUniqueOrThrow({
    where: {
      name: "Ready to Assign",
      userId,
    },
  });

  await prisma.transaction.create({
    data: {
      ...transaction,
      categoryId: transaction.categoryId,
    },
  });

  if (transaction.categoryId === readyToAssignCategory.id) {
    await prisma.month.updateMany({
      where: {
        categoryId: transaction.categoryId,
        month: {
          gte: roundToStartOfMonth(transactionDate),
        },
      },
      data: {
        activity: {
          increment: balanceModifier,
        },
      },
    });

    const months = await prisma.month.findMany({
      where: {
        categoryId: transaction.categoryId,
      },
      orderBy: {
        month: "desc",
      },
    });
    return;
  }

  // CATEGORISED TRANSACTION
  await prisma.month.update({
    where: {
      categoryId_month: {
        categoryId: transaction.categoryId,
        month: roundToStartOfMonth(transactionDate),
      },
    },
    data: {
      activity: {
        increment: balanceModifier,
      },
    },
  });
};
