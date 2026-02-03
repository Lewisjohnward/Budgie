import { Prisma } from "@prisma/client";
import {
  type TransactionId,
  db,
  type DomainNormalTransaction,
  type TransactionInsertData,
} from "./transaction.types";
import { type CategoryId } from "../category/category.types";
import { type AccountId } from "../account/account.types";
import { type PayeeId } from "../payee/payee.types";
import { type CategoryGroupId } from "../categorygroup/categoryGroup.types";
import { type UserId } from "../../user/auth/auth.types";

export interface TransactionRepository {
  getTransactionsByIdWithPairs(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    userId: UserId
  ): Promise<db.Transaction[]>;

  getTransactionById(
    tx: Prisma.TransactionClient,
    userId: UserId,
    transactionId: TransactionId
  ): Promise<db.Transaction | null>;

  getNormalTransactionsByIds(
    tx: Prisma.TransactionClient,
    userId: UserId,
    transactionIds: TransactionId[]
  ): Promise<DomainNormalTransaction[]>;

  getTransactionsByCategoryId(
    tx: Prisma.TransactionClient,
    categoryId: CategoryId
  ): Promise<db.Transaction[]>;

  getTransactionsByCategoryGroupId(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<db.Transaction[]>;

  getTransactionsByAccountId(
    tx: Prisma.TransactionClient,
    accountId: AccountId
  ): Promise<db.Transaction[]>;

  createTransaction(
    tx: Prisma.TransactionClient,
    transaction: Prisma.TransactionUncheckedCreateInput
  ): Promise<db.Transaction>;

  createTransactions(
    tx: Prisma.TransactionClient,
    transactions: readonly TransactionInsertData[]
  ): Promise<void>;

  updateTransaction(
    tx: Prisma.TransactionClient,
    transactionId: TransactionId,
    data: Prisma.TransactionUncheckedUpdateInput
  ): Promise<db.Transaction>;

  bulkUpdateMemo(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    memo: string
  ): Promise<void>;

  bulkUpdateCategoryId(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    categoryId: CategoryId
  ): Promise<void>;

  bulkUpdateAccountId(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    accountId: AccountId
  ): Promise<void>;

  bulkUpdateTransferAccountId(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    transferAccountId: AccountId
  ): Promise<void>;

  deleteTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: TransactionId[],
    userId: UserId
  ): Promise<void>;

  updateTransactionsPayee(
    tx: Prisma.TransactionClient,
    userId: UserId,
    payeeId: PayeeId | PayeeId[],
    newPayeeId: PayeeId | null
  ): Promise<void>;
}
