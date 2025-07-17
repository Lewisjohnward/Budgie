import { Prisma, Transaction } from "@prisma/client";
import { TransactionPayload } from "./transaction.schema";

export interface TransactionRepository {
  getTransactionsById(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<Transaction[]>;

  getTransactionsByCategoryId(
    tx: Prisma.TransactionClient,
    categoryId: string,
  ): Promise<Transaction[]>;

  getTransactionsByAccountId(
    tx: Prisma.TransactionClient,
    accountId: string,
  ): Promise<Transaction[]>;

  //TODO: THIS TYPING NEEDS IMPROVING
  createTransaction(
    tx: Prisma.TransactionClient,
    transaction: TransactionPayload & { categoryId: string },
  ): Promise<Transaction>;

  //TODO: THIS TYPING NEEDS IMPROVING
  createTransactions(
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[],
  ): Promise<void>;

  deleteTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<void>;
}
