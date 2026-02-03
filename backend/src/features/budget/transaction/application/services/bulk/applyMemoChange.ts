import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { type TransactionId } from "../../../transaction.types";

/**
 * Applies a memo update to a set of transactions.
 *
 * This function performs a bulk update of the `memo` field for the specified
 * transaction IDs. It **does not enforce domain invariants** and does **not**
 * trigger any derived updates (such as balances, categories, or transfers).
 *
 * Validation of transaction ownership, existence, or business rules should be
 * handled by the caller before invoking this function.
 *
 * @param tx - Prisma transaction client used to execute the update atomically.
 * @param transactionIds - Array of transaction IDs whose memo will be updated.
 * @param memo - The new memo value to set for all specified transactions.
 *
 * @returns A promise that resolves once the memo updates have been applied.
 */
export const applyMemoChange = async (
  tx: Prisma.TransactionClient,
  transactionIds: TransactionId[],
  memo: string
): Promise<void> => {
  await transactionRepository.bulkUpdateMemo(tx, transactionIds, memo);
};
