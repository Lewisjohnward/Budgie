import { Account, Category, Month, Prisma, Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { TransactionPayload } from "../../features/budget/transaction/transaction.schema";
import { BudgetRepository } from "../../features/budget/budget.repository";

export const budgetRepository: BudgetRepository = {
  // insert tx
  getPastMonths: async function(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ month: Date }[]> {
    return tx.month.findMany({
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
  },
  // insert tx - get category ids for adding months
  getAllCategoryIds: function(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ id: string }[]> {
    return tx.category.findMany({
      where: { userId },
      select: { id: true },
    });
  },
  // insert tx
  getAccount: async function(
    tx: Prisma.TransactionClient,
    accountId: string,
    userId: string,
  ): Promise<Account> {
    return tx.account.findUniqueOrThrow({
      where: {
        id: accountId,
        userId,
      },
    });
  },

  // insert tx - creates missing months
  createMissingMonths: async function(
    tx: Prisma.TransactionClient,
    months: Prisma.MonthCreateManyInput[],
  ): Promise<void> {
    await tx.month.createMany({
      data: months,
    });
  },

  // insert tx
  createTransaction: function(
    tx: Prisma.TransactionClient,
    transaction: TransactionPayload & { categoryId: string },
  ): Promise<Transaction> {
    return tx.transaction.create({
      data: transaction,
    });
  },

  // duplicate txs
  createTransactions: async function(
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[],
  ): Promise<void> {
    await tx.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  },

  // insert tx
  updateAccountBalance: async function(
    tx: Prisma.TransactionClient,
    account: Account,
    insertedTransaction: Transaction,
  ): Promise<void> {
    const updatedBalance = account.balance.add(
      insertedTransaction.inflow.sub(insertedTransaction.outflow),
    );
    await tx.account.update({
      where: { id: account.id },
      data: { balance: updatedBalance },
    });
  },
  getAllRtaMonths: function(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]> {
    return tx.month.findMany({
      where: {
        categoryId: rtaCategoryId,
        category: {
          userId,
        },
      },
      orderBy: {
        month: "asc",
      },
    });
  },
  getAllCategoryMonths: function(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]> {
    return tx.month.findMany({
      where: {
        category: { userId },
        categoryId: { not: rtaCategoryId },
      },
      orderBy: { month: "asc" },
    });
  },

  // insert tx
  updateRtaMonthActivity: async function(
    tx: Prisma.TransactionClient,
    rtaCategoryId: string,
    userId: string,
    date: Date,
    amount: Decimal,
  ): Promise<void> {
    await tx.month.updateMany({
      where: {
        categoryId: rtaCategoryId,
        category: {
          userId,
        },
        month: {
          equals: date,
        },
      },
      data: {
        activity: {
          increment: amount,
        },
      },
    });
  },
  getCategoryMonths: function(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryId: string,
    date: Date,
  ): Promise<Month[]> {
    return tx.month.findMany({
      where: {
        categoryId: categoryId,
        category: {
          userId,
        },
        month: {
          gte: date,
        },
      },
      orderBy: {
        month: "asc",
      },
    });
  },

  // delete txs
  updateAccountBalances: async function(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: { [accountId: string]: Decimal },
  ): Promise<void> {
    for (const accountId in accountBalanceChanges) {
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: accountBalanceChanges[accountId] },
        },
      });
    }
  },

  // delete txs / insert tx
  updateRtaMonths: async function(
    tx: Prisma.TransactionClient,
    updatedRtaMonths: (Pick<Month, "available" | "month" | "activity"> & {
      id?: string;
    })[],
  ): Promise<void> {
    await Promise.all(
      updatedRtaMonths.map((m) =>
        tx.month.update({
          where: {
            id: m.id,
          },
          data: {
            activity: m.activity,
            available: m.available,
          },
        }),
      ),
    );
  },

  // delete txs
  deleteTransactions: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<void> {
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
  },

  // insert tx // delete tx
  updateCategoryMonths: async function(
    tx: Prisma.TransactionClient,
    updatedCategoryMonths: Month[],
  ): Promise<void> {
    await Promise.all(
      updatedCategoryMonths.map(async (m) =>
        tx.month.update({
          where: {
            id: m.id,
          },
          data: {
            activity: m.activity,
            available: m.available,
            assigned: m.assigned,
          },
        }),
      ),
    );
  },
  getCategoryMonthsFromDate: async function(
    tx: Prisma.TransactionClient,
    categoryIds: string[],
    month: Date,
  ): Promise<Month[]> {
    return await tx.month.findMany({
      where: {
        categoryId: { in: categoryIds },
        month: {
          gte: month,
        },
      },
      orderBy: {
        month: "asc",
      },
    });
  },

  // delete tx
  getTransactions: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        account: {
          userId: userId,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  },
};

// delete tx
export async function getCategoryMonthsFromDate(
  tx: Prisma.TransactionClient,
  categoryIds: string[],
  month: Date,
) {
  return await tx.month.findMany({
    where: {
      categoryId: { in: categoryIds },
      month: {
        gte: month,
      },
    },
    orderBy: {
      month: "asc",
    },
  });
}

// insert tx
export const updateAccountBalance = async (
  tx: Prisma.TransactionClient,
  account: Account,
  insertedTransaction: Transaction,
) => { };

// insert tx / delete tx
export const getAllRtaMonths = async (
  tx: Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
) => { };

// insert tx / delete tx
export const getAllCategoryMonths = async (
  tx: Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
) => { };
