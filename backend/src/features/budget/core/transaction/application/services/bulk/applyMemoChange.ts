import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import {
  type DomainNormalTransaction,
  type DomainTransferTransaction,
} from "../../../transaction.types";

type DomainTransaction = DomainNormalTransaction | DomainTransferTransaction;

/**
 * Applies a bulk memo update to a collection of normal and transfer transactions.
 *
 * All database updates are performed within the provided Prisma transaction
 * client (`tx`) and should be committed or rolled back atomically by the caller.
 *
 * The function performs the following steps:
 *
 * 1. Returns an empty array if no transactions were supplied.
 *
 * 2. Extracts the IDs of the supplied transactions.
 *
 * 3. Performs a bulk update of the `memo` field for all specified transaction IDs.
 *
 * 4. Returns new transaction objects with the updated memo, preserving all
 *    other properties of the original domain transactions.
 *
 * Notes:
 * - Both normal and transfer transactions are supported.
 * - Updated transactions are constructed from the supplied domain objects;
 *   they are not re-fetched from the database.
 * - Validation of transaction ownership, existence, and business rules
 *   must be handled by the caller before invoking this function.
 *
 * @param tx - Prisma transaction client used for the database update.
 * @param transactions - Normal and transfer transactions whose memos
 *   should be updated.
 * @param memo - The new memo value to apply to all specified transactions.
 *
 * @returns A promise resolving to the updated domain transactions.
 * Returns an empty array if no transactions were supplied.
 */
export const applyMemoChange = async (
  tx: Prisma.TransactionClient,
  transactions: DomainTransaction[],
  memo: string
): Promise<DomainTransaction[]> => {
  if (transactions.length === 0) return [];

  const transactionIds = transactions.map((transaction) => transaction.id);

  await transactionRepository.bulkUpdateMemo(tx, transactionIds, memo);

  return transactions.map((transaction) => ({
    ...transaction,
    memo,
  }));
};
