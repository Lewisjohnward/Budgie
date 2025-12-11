import { Prisma, Transaction } from "@prisma/client";
import { BulkTransactionUpdates } from "../../../shared/repository/transactionRepositoryImpl";
import { NormalTransactionEntity } from "./transaction.types";

export interface TransactionRepository {
  getTransactionsByIdWithPairs(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string
  ): Promise<Transaction[]>;

  getTransactionById(
    tx: Prisma.TransactionClient,
    userId: string,
    transactionId: string
  ): Promise<Transaction | null>;

  getNormalTransactionsByIds(
    tx: Prisma.TransactionClient,
    userId: string,
    transactionIds: string[]
  ): Promise<NormalTransactionEntity[]>;

  getTransactionsByCategoryId(
    tx: Prisma.TransactionClient,
    categoryId: string
  ): Promise<Transaction[]>;

  getTransactionsByCategoryGroupId(
    tx: Prisma.TransactionClient,
    categoryGroupId: string
  ): Promise<Transaction[]>;

  getTransactionsByAccountId(
    tx: Prisma.TransactionClient,
    accountId: string
  ): Promise<Transaction[]>;

  //TODO: THIS TYPING NEEDS IMPROVING
  createTransaction(
    tx: Prisma.TransactionClient,
    transaction: Prisma.TransactionUncheckedCreateInput
  ): Promise<Transaction>;

  //TODO: THIS TYPING NEEDS IMPROVING
  createTransactions(
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[]
  ): Promise<void>;

  updateTransaction(
    tx: Prisma.TransactionClient,
    transactionId: string,
    data: Prisma.TransactionUncheckedUpdateInput
  ): Promise<Transaction>;

  updateTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    data: BulkTransactionUpdates
  ): Promise<void>;

  bulkUpdateMemo(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    memo: string
  ): Promise<void>;

  bulkUpdateCategoryId(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    categoryId: string
  ): Promise<void>;

  bulkUpdateAccountId(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    accountId: string
  ): Promise<void>;

  bulkUpdateTransferAccountId(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    transferAccountId: string
  ): Promise<void>;

  deleteTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string
  ): Promise<void>;

  updateTransactionsPayee(
    tx: Prisma.TransactionClient,
    userId: string,
    payeeId: string | string[],
    newPayeeId: string | null
  ): Promise<void>;
}
