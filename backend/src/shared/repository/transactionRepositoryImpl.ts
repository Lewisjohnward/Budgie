import { Prisma, Transaction } from "@prisma/client";
import { TransactionRepository } from "../../features/budget/transaction/transaction.repository";
import { NormalTransactionEntity } from "../../features/budget/transaction/transaction.types";
export type BulkTransactionUpdates = {
  memo?: string | null;
  categoryId?: string | null;
  accountId?: string;
};
export const transactionRepository: TransactionRepository = {
  createTransaction: function(
    tx: Prisma.TransactionClient,
    transaction: Prisma.TransactionUncheckedCreateInput
  ): Promise<Transaction> {
    return tx.transaction.create({
      data: transaction,
    });
  },

  createTransactions: async function(
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[]
  ): Promise<void> {
    await tx.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  },

  deleteTransactions: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string
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

  updateTransaction: async function(
    tx: Prisma.TransactionClient,
    transactionId: string,
    data: BulkTransactionUpdates
  ): Promise<Transaction> {
    return tx.transaction.update({
      where: { id: transactionId },
      data,
    });
  },

  bulkUpdateMemo: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    memo: string
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { memo },
    });
    return;
  },

  bulkUpdateCategoryId: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    categoryId: string
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { categoryId },
    });
    return;
  },

  bulkUpdateAccountId: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    accountId: string
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { accountId },
    });
    return;
  },

  bulkUpdateTransferAccountId: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    transferAccountId: string
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { transferAccountId },
    });
  },

  updateTransactions: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    data: Prisma.TransactionUncheckedUpdateInput
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: {
        id: { in: transactionIds },
      },
      data,
    });
  },

  getTransactionsByIdWithPairs: async function(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string
  ): Promise<Transaction[]> {
    // Always fetch both requested transactions and their paired transactions
    // Fetch transactions where:
    // 1. id is in the provided list, OR
    // 2. transferTransactionId is in the provided list (paired transactions)
    return await tx.transaction.findMany({
      where: {
        account: {
          userId: userId,
        },
        OR: [
          {
            id: {
              in: transactionIds,
            },
          },
          {
            transferTransactionId: {
              in: transactionIds,
            },
          },
        ],
      },
      orderBy: {
        date: "asc",
      },
    });
  },

  getTransactionById: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    transactionId: string
  ): Promise<Transaction | null> {
    return await tx.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId },
      },
    });
  },
  getNormalTransactionsByIds: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    ids: string[]
  ): Promise<NormalTransactionEntity[]> {
    return tx.transaction.findMany({
      where: {
        id: { in: ids },
        account: { userId },
        transferAccountId: null,
        categoryId: { not: null },
      },
      orderBy: { date: "asc" },
    }) as unknown as NormalTransactionEntity[];
  },
  getTransactionsByCategoryId: async function(
    tx: Prisma.TransactionClient,
    categoryId: string
  ): Promise<Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        categoryId: categoryId,
      },
    });
  },

  getTransactionsByAccountId: async function(
    tx: Prisma.TransactionClient,
    accountId: string
  ): Promise<Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        accountId,
      },
    });
  },
  getTransactionsByCategoryGroupId: async function(
    tx: Prisma.TransactionClient,
    categoryGroupId: string
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

  updateTransactionsPayee: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    payeeId: string | string[],
    newPayeeId: string | null
  ): Promise<void> {
    const payeeIds = Array.isArray(payeeId) ? payeeId : [payeeId];

    await tx.transaction.updateMany({
      where: {
        payeeId: {
          in: payeeIds,
        },
        account: {
          userId: userId,
        },
      },
      data: {
        payeeId: newPayeeId,
      },
    });
  },
};
