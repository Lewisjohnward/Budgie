import { PrismaClient } from "@prisma/client";
import { accountSchema, UpdatedTransaction } from "../schemas";
import { AccountPayload, TransactionPayload } from "../dto";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CategoryGroupPayload,
  CategoryPayload,
} from "../schemas/CategorySchema";
import { getIntermediateMonths, roundToStartOfMonth } from ".";
import { toZonedTime } from "date-fns-tz";

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

export const userOwnsAccount = async (accountId: string, userId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId: userId,
    },
  });

  if (!account) {
    throw new Error("Unable to add transaction");
  }
};

function convertDecimalToNumber(value: Decimal | null | undefined): number {
  return value ? value.toNumber() : 0;
}

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

export const selectCategories = async (userId: string) => {
  const categoryGroups = await prisma.categoryGroup.findMany({
    where: {
      userId,
    },
    include: {
      categories: {
        include: {
          months: {
            orderBy: {
              month: "asc",
            },
          },
        },
      },
    },
  });

  const categories = categoryGroups.map((group) => ({
    ...group,
    categories: group.categories.map((category) => ({
      ...category,
      assigned: convertDecimalToNumber(category.assigned),
      activity: convertDecimalToNumber(category.activity),
      months: category.months.map((month) => ({
        ...month,
        activity: convertDecimalToNumber(month.activity),
        assigned: convertDecimalToNumber(month.assigned),
      })),
    })),
  }));

  return categories;
};

export const validateAccount = ({
  userId,
  name,
  type,
  balance,
}: {
  userId: string;
  name: string;
  type: string;
  balance: number;
}) => {
  return accountSchema.parse({ userId, name, type, balance });
};

export const createAccount = async (account: AccountPayload) => {
  return await prisma.account.create({
    data: {
      ...account,
      balance: 0,
    },
  });
};

export const initialiseAccount = async (account: AccountPayload) => {
  const createdAccount = await createAccount(account);

  // TODO: THE NAME needs to be protected
  // const defaultCategory = await prisma.category.findFirstOrThrow({
  //   where: {
  //     name: "Inflow: Ready to Assign",
  //   },
  // });

  const readyToAssignCategory = await prisma.category.findFirstOrThrow({
    where: {
      userId: account.userId,
      name: "Ready to Assign",
    },
  });

  await insertTransaction(account.userId, {
    accountId: createdAccount.id,
    inflow: account.balance,
    categoryId: readyToAssignCategory.id,
  });

  if (account.balance > 0) {
    updateReadyToAssignMonths(
      readyToAssignCategory.id,
      account.balance,
      account.userId,
    );
  }
};

export const updateMonth = async ({
  id,
  assigned,
  userId,
}: {
  id: string;
  assigned: number;
  userId: string;
}) => {
  await prisma.month.update({
    where: {
      id,
      category: {
        userId,
      },
    },
    data: {
      assigned,
    },
  });
};

export const calculateChangeInAssignedForMonth = async ({
  monthId,
  assigned,
  userId,
}: {
  monthId: string;
  assigned: number;
  userId: string;
}) => {
  const month = await prisma.month.findFirstOrThrow({
    where: {
      id: monthId,
      category: {
        userId,
      },
    },
  });

  return convertDecimalToNumber(month.assigned) - assigned;
};

export const updateReadyToAssignMonths = async (
  categoryId: string,
  amount: number,
  userId: string,
) => {
  const { startOfCurrentMonth } = getMonth();

  const assignedCurrentMonth = await prisma.month.findFirstOrThrow({
    where: {
      categoryId,
      category: {
        userId,
      },
      month: {
        gte: startOfCurrentMonth,
      },
    },
  });

  const oldAssignableAmount =
    convertDecimalToNumber(assignedCurrentMonth?.activity) || 0;

  const updatedAssignableAmount = oldAssignableAmount + amount;

  const updatedMonths = await prisma.month.updateMany({
    where: {
      categoryId,
      month: {
        gte: startOfCurrentMonth,
      },
    },
    data: {
      activity: updatedAssignableAmount,
    },
  });
};

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

  const transactionDate = toZonedTime(new Date(transaction.date || ""), "UTC");
  const utcNow = toZonedTime(new Date(), "UTC");
  if (transactionDate >= utcNow) {
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
  await prisma.transaction.create({
    data: {
      ...transaction,
      categoryId: transaction.categoryId,
    },
  });

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

const getMonth = () => {
  const today = new Date();
  const startOfCurrentMonth = roundToStartOfMonth(today);

  const nextMonth = new Date(
    startOfCurrentMonth.getFullYear(),
    startOfCurrentMonth.getMonth() + 1,
    1,
    1,
  );

  return { startOfCurrentMonth, nextMonth };
};

export const initialiseCategories = async (userId: string) => {
  const inflow = await prisma.categoryGroup.create({
    data: {
      userId,
      name: "Inflow",
    },
  });

  const uncategorisedGroup = await prisma.categoryGroup.create({
    data: {
      userId,
      name: "Uncategorised",
    },
  });

  const billsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Bills",
    },
  });

  const otherCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Other",
    },
  });

  createCategory({
    userId,
    categoryGroupId: uncategorisedGroup.id,
    name: "Uncategorised Transactions",
  });

  createCategory({
    userId,
    categoryGroupId: inflow.id,
    name: "Ready to Assign",
  });
  createCategory({
    userId,
    categoryGroupId: billsCategoryGroup.id,
    name: "🏠 Rent/Mortgage",
  });
  createCategory({
    userId,
    categoryGroupId: billsCategoryGroup.id,
    name: "🔌 Utilities",
  });
  createCategory({
    userId,
    categoryGroupId: otherCategoryGroup.id,
    name: "❗️ Stuff I forgot to budget for",
  });
};

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
      transactionsToInsert.map((transaction) =>
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

export const updateTransactions = async (
  userId: string,
  updatedTransaction: UpdatedTransaction,
) => {
  const { id: id, ...fields } = updatedTransaction;

  return;

  // await prisma.transaction.update({
  //   where: {
  //     id: id,
  //     account: {
  //       userId,
  //     },
  //   },
  //   data: {
  //     ...fields,
  //   },
  // });
};

export const createCategoryGroup = async (
  categoryGroup: CategoryGroupPayload,
) => {
  const newCategoryGroup = await prisma.categoryGroup.create({
    data: categoryGroup,
  });
};

export const createCategory = async (category: CategoryPayload) => {
  const newCategory = await prisma.category.create({
    data: category,
  });

  const { startOfCurrentMonth, nextMonth } = getMonth();

  await prisma.month.create({
    data: {
      categoryId: newCategory.id,
      month: startOfCurrentMonth,
    },
  });

  await prisma.month.create({
    data: {
      categoryId: newCategory.id,
      month: nextMonth,
    },
  });
};
