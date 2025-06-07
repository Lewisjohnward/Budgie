import { Account, Month, Prisma, Transaction } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { TransactionPayload } from "./transaction/transaction.schema";

export interface BudgetRepository {
  // insert tx
  getAccount(
    tx: Prisma.TransactionClient,
    accountId: string,
    userId: string,
  ): Promise<Account>;

  // insert tx - used when calculating missing months
  getPastMonths(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ month: Date }[]>;

  // insert tx - used to create months for categories
  getAllCategoryIds(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<{ id: string }[]>;

  // insert tx - used when inserting missing months
  createMissingMonths(
    tx: Prisma.TransactionClient,
    months: Prisma.MonthCreateManyInput[],
  ): Promise<void>;

  // insertTx
  createTransaction(
    tx: Prisma.TransactionClient,
    transaction: TransactionPayload & { categoryId: string },
  ): Promise<Transaction>;

  // duplicate txs
  createTransactions(
    tx: Prisma.TransactionClient,
    transactions: Omit<Transaction, "id">[],
  ): Promise<void>;

  // insert tx
  updateAccountBalance(
    tx: Prisma.TransactionClient,
    account: Account,
    insertedTransaction: Transaction,
  ): Promise<void>;

  // insert tx / delete txs
  getAllRtaMonths(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]>;

  // insert tx / delete txs
  getAllCategoryMonths(
    tx: Prisma.TransactionClient,
    userId: string,
    rtaCategoryId: string,
  ): Promise<Month[]>;

  // insert tx
  updateRtaMonthActivity(
    tx: Prisma.TransactionClient,
    rtaCategoryId: string,
    userId: string,
    date: Date,
    amount: Decimal,
  ): Promise<void>;

  // insert tx
  updateCategoryMonths(
    tx: Prisma.TransactionClient,
    updatedCategoryMonths: Month[],
  ): Promise<void>;

  // insert tx
  getCategoryMonths(
    tx: Prisma.TransactionClient,
    userId: string,
    categoryId: string,
    date: Date,
  ): Promise<Month[]>;

  // deleteTxs
  getTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<Transaction[]>;

  // getTxsToDelete
  // deleteTxs
  // getCategoryMonths
  updateAccountBalances(
    tx: Prisma.TransactionClient,
    accountBalanceChanges: { [accountId: string]: Decimal },
  ): Promise<void>;

  // delete txs
  getCategoryMonthsFromDate(
    tx: Prisma.TransactionClient,
    categoryIds: string[],
    month: Date,
  ): Promise<Month[]>;

  // deleteTxs
  updateRtaMonths(
    tx: Prisma.TransactionClient,
    updatedRtaMonths: (Pick<Month, "available" | "month" | "activity"> & {
      id?: string;
    })[],
  ): Promise<void>;

  // deleteTxs
  deleteTransactions(
    tx: Prisma.TransactionClient,
    transactionIds: string[],
    userId: string,
  ): Promise<void>;
}
