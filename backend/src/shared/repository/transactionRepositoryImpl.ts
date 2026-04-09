import { Prisma } from "@prisma/client";
import { TransactionRepository } from "../../features/budget/transaction/transaction.repository";
import {
  type DomainNormalTransaction,
  type TransactionId,
  type db,
  type TransactionInsertData,
} from "../../features/budget/transaction/transaction.types";
import { type CategoryId } from "../../features/budget/category/core/category.types";
import { type AccountId } from "../../features/budget/account/account.types";
import { transactionMapper } from "../../features/budget/transaction/transaction.mapper";
import { type PayeeId } from "../../features/budget/payee/payee.types";
import { type CategoryGroupId } from "../../features/budget/categorygroup/categoryGroup.types";
import { type UserId } from "../../features/user/auth/auth.types";

export const transactionRepository: TransactionRepository = {
  createTransaction: function (
    tx: Prisma.TransactionClient,
    transaction: Prisma.TransactionUncheckedCreateInput
  ): Promise<db.Transaction> {
    const row = tx.transaction.create({
      data: transaction,
    });
    return row;
  },

  createTransactions: async function (
    tx: Prisma.TransactionClient,
    transactions: TransactionInsertData[]
  ): Promise<void> {
    const dbInsertData = transactions.map(({ type, ...rest }) => rest);
    await tx.transaction.createMany({
      data: dbInsertData,
      skipDuplicates: true,
    });
  },

  deleteTransactions: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    userId: UserId
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

  updateTransaction: async function (
    tx: Prisma.TransactionClient,
    transactionId: TransactionId,
    data: Prisma.TransactionUncheckedUpdateInput
  ): Promise<db.Transaction> {
    return tx.transaction.update({
      where: { id: transactionId },
      data,
    });
  },

  bulkUpdateMemo: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    memo: UserId
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { memo },
    });
    return;
  },

  bulkUpdateCategoryId: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    categoryId: CategoryId
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { categoryId },
    });
    return;
  },

  bulkUpdateAccountId: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    accountId: AccountId
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { accountId },
    });
    return;
  },

  bulkUpdateTransferAccountId: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    transferAccountId: AccountId
  ): Promise<void> {
    await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { transferAccountId },
    });
  },

  getTransactionsByIdWithPairs: async function (
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    userId: UserId
  ): Promise<db.Transaction[]> {
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

  getTransactionById: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    transactionId: TransactionId
  ): Promise<db.Transaction | null> {
    return await tx.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId },
      },
    });
  },
  getNormalTransactionsByIds: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    ids: TransactionId[]
  ): Promise<DomainNormalTransaction[]> {
    const rows = await tx.transaction.findMany({
      where: {
        id: { in: ids },
        account: { userId },
        transferAccountId: null,
        categoryId: { not: null },
      },
      orderBy: { date: "asc" },
    });

    // TODO:(lewis 2026-02-13 09:45) mapper needs to be removed
    return rows.map((r) => transactionMapper.toDomainNormalTransaction(r));
  },
  getTransactionsByCategoryId: async function (
    tx: Prisma.TransactionClient,
    categoryId: CategoryId
  ): Promise<db.Transaction[]> {
    return await tx.transaction.findMany({
      where: {
        categoryId: categoryId,
      },
    });
  },

  getTransactionIdsByAccountId: async function (
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<string[]> {
    const rows = await tx.transaction.findMany({
      where: {
        accountId,
      },
      select: { id: true },
    });

    return rows.map(({ id }) => id);
  },

  getTransactionsByCategoryGroupId: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<db.Transaction[]> {
    const transactions = await tx.transaction.findMany({
      where: {
        category: {
          categoryGroupId,
        },
      },
    });

    return transactions;
  },

  updateTransactionsPayee: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    payeeId: PayeeId | PayeeId[],
    newPayeeId: PayeeId | null
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

  existsUserTransactionForAccount: async function (
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<boolean> {
    const exists = await tx.transaction.findFirst({
      where: {
        accountId,
        origin: "USER",
      },
      select: { id: true },
    });

    return !!exists;
  },
};
