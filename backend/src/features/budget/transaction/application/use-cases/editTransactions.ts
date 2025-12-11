import { prisma } from "../../../../../shared/prisma/client";
import { EditBulkTransactionsPayload } from "../../transaction.schema";
import { transactionService } from "../../transaction.service";

// TODO:(lewis 2026-01-22 13:36) update jsdoc

/**
 * Updates multiple transactions in bulk with the same field values.
 * Currently supports updating categoryId, accountId and memo for multiple transactions at once.
 * At least one update field must be provided.
 *
 * @param payload - The bulk edit transactions payload
 * @param payload.userId - The ID of the user performing the operation
 * @param payload.transactionIds - Array of transaction IDs to update
 * @param payload.updates - Object containing the fields to update
 * @param payload.updates.categoryId - Optional category ID to set for all transactions (or null to clear)
 * @param payload.updates.accountId - Optional account ID to set for all transactions
 * @throws {NoTransactionsFoundError} - If one or more transactions don't exist or user doesn't own them (404)
 *
 * @example
 * // Categorize multiple transactions
 * await editTransactions({
 *   userId: 'user-123',
 *   transactionIds: ['tx-1', 'tx-2', 'tx-3'],
 *   updates: { categoryId: 'cat-456' }
 * });
 *
 * // Move transactions to different account
 * await editTransactions({
 *   userId: 'user-123',
 *   transactionIds: ['tx-1', 'tx-2'],
 *   updates: { accountId: 'acc-789' }
 * });
 */

export const editTransactions = async (
  userId: string,
  payload: EditBulkTransactionsPayload
) => {
  const { transactionIds, updates } = payload;

  await prisma.$transaction(async (tx) => {
    const { normalTransactions, allTransferTransactions } =
      await transactionService.getTransactionsWithPairs(
        tx,
        userId,
        transactionIds
      );

    // -------------------------
    // MODE: memo
    // -------------------------
    if (updates.memo !== undefined) {
      await transactionService.bulk.applyMemoChange(
        tx,
        transactionIds,
        updates.memo
      );

      return;
    }

    // -------------------------
    // MODE: categoryId (exclude transfers)
    // -------------------------
    if (updates.categoryId !== undefined) {
      await transactionService.bulk.applyCategoryChange(
        tx,
        userId,
        updates.categoryId,
        normalTransactions
      );
      return;
    }

    // -------------------------
    // MODE: accountId
    // -------------------------
    if (updates.accountId !== undefined) {
      await transactionService.bulk.applyAccountChange(
        tx,
        userId,
        updates.accountId,
        transactionIds,
        normalTransactions,
        allTransferTransactions
      );

      return;
    }
  });
};
