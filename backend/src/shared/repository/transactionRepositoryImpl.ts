import { Prisma, Transaction } from "@prisma/client";
import { TransactionPayload } from "../../features/budget/transaction/transaction.schema";
import { TransactionRepository } from "../../features/budget/transaction/transaction.repository";

export const transactionRepository: TransactionRepository = {
  createTransaction: function (
    tx: Prisma.TransactionClient,
    transaction: TransactionPayload & { categoryId: string },
  ): Promise<Transaction> {
    return tx.transaction.create({
      data: transaction,
    });
  },

  createTransactions: async function (
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[],
  ): Promise<void> {
    await tx.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  },

  deleteTransactions: async function (
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

  getTransactionsById: async function (
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

  getTransactionsByCategoryId: async function (
    tx: Prisma.TransactionClient,
    categoryId: string,
  ): Promise<Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        categoryId: categoryId,
      },
    });
  },

  getTransactionsByAccountId: async function (
    tx: Prisma.TransactionClient,
    accountId: string,
  ): Promise<Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        accountId,
      },
    });
  },
  getTransactionsByCategoryGroupId: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: string,
  ): Promise<Transaction[]> {
    const transactions = await tx.transaction.findMany({
      where: {
        category: {
          categoryGroupId,
        },
      },
    });

    return transactions;
  },
};
