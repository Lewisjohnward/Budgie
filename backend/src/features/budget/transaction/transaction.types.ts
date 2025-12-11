import { Transaction as PrismaTransaction } from "@prisma/client";
import { TransactionData } from "./transaction.schema";

/**
 * Internal convenience: same as TransactionData but guarantees a concrete Date.
 */
export type TransactionDataWithDate = Omit<TransactionData, "date"> & {
  date: Date;
};

/**
 * A transfer transaction that has been created in the database.
 * Extends Prisma's Transaction but enforces null categoryId.
 */
export type TransferTransactionEntity = Omit<
  PrismaTransaction,
  "categoryId" | "transferTransactionId"
> & {
  categoryId: null;
  transferTransactionId: string;
};

/**
 * A normal (non-transfer) transaction that has been created in the database.
 * Extends Prisma's Transaction and ensures categoryId is always a string.
 */
export type NormalTransactionEntity = Omit<PrismaTransaction, "categoryId"> & {
  categoryId: string;
};

/**
 * Data structure for creating a normal (non-transfer) transaction.
 * Normal transactions must have a valid categoryId and date.
 */
export type NormalTransactionCreateData = Omit<
  TransactionDataWithDate,
  "categoryId"
> & {
  categoryId: string;
};

/**
 * Insert input for a normal transaction: guarantees date is present.
 * categoryId can still be optional because you resolve it to uncategorised in the service.
 */
export type NormalTransactionInsertData = TransactionDataWithDate;

/**
 * Insert input for a transfer transaction: guarantees transferAccountId + date are present.
 */
export type TransferTransactionInsertData = Omit<
  TransactionDataWithDate,
  "transferAccountId"
> & {
  transferAccountId: string;
};
