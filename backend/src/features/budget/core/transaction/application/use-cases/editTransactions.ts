import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { type AccountId, asAccountId } from "../../../account/account.types";
import { asCategoryId } from "../../../category/core/category.types";
import { type EditTransactionsResult } from "../../contracts/editTransactions.contract";
import { NoValidTransactionUpdateOperationError } from "../../transaction.errors";
import { type EditBulkTransactionsPayload } from "../../transaction.schema";
import { transactionService } from "../../transaction.service";
import { asTransactionId, type TransactionId } from "../../transaction.types";

/**
 * Represents the internal command for editing transactions after the initial payload has been processed.
 * It uses strongly-typed IDs (`TransactionId`, `AccountId`) instead of raw strings
 * to ensure type safety within the use case.
 */
export type EditTransactionsCommand = Omit<
  EditBulkTransactionsPayload,
  "userId" | "updates" | "transactionIds"
> & {
  userId: UserId;
  transactionIds: TransactionId[];
  updates: Omit<EditBulkTransactionsPayload["updates"], "accountId"> & {
    accountId?: AccountId;
  };
};

/**
 * Transforms the raw `EditBulkTransactionsPayload` into a `EditTransactionsCommand`,
 * converting plain string IDs into strongly-typed branded types.
 *
 * @param p - The raw payload from the request.
 * @returns The transformed command object with typed IDs.
 */
export const toEditAccountCommand = (
  p: EditBulkTransactionsPayload
): EditTransactionsCommand => ({
  ...p,
  userId: asUserId(p.userId),
  transactionIds: p.transactionIds.map((id) => asTransactionId(id)),
  updates: {
    ...p.updates,
    accountId: p.updates.accountId
      ? asAccountId(p.updates.accountId)
      : undefined,
  },
});

/**
 * Applies bulk updates to a set of transactions belonging to a specific user.
 *
 * The function orchestrates the update operation based on the fields provided
 * in the payload, executing all database operations within a single Prisma
 * transaction to ensure atomicity.
 *
 * The function performs the following steps:
 *
 * 1. Converts the raw payload into an internal command with strongly typed IDs.
 *
 * 2. Retrieves the selected transactions, including normal transactions,
 *    transfer transactions, and their counterparts.
 *
 * 3. Determines the update operation based on the supplied fields:
 *
 *    - Memo:
 *      Updates the memo of the selected normal and transfer transactions.
 *
 *    - Category:
 *      Updates the category of selected normal transactions.
 *      Transfer transactions are excluded from category changes.
 *
 *    - Account:
 *      Updates the account assignment of selected transactions while
 *      maintaining transfer consistency and recalculating affected
 *      account balances.
 *
 * 4. Returns the updated transactions and any affected accounts or months,
 *    depending on the operation performed.
 *
 * Notes:
 * - Only one update operation is processed per invocation.
 * - All database changes are executed within a single Prisma transaction.
 *
 * @param payload - The validated bulk edit payload containing the user ID,
 *   selected transaction IDs, and the update fields to apply.
 *
 * @returns A promise resolving to the updated transactions, affected accounts,
 *   and affected months. Unaffected result collections are returned as empty arrays.
 *
 * @throws {NoValidTransactionUpdateOperationError}
 * Thrown when the payload does not contain a supported transaction update operation.
 *
 * @throws Any errors propagated by the underlying transaction services or
 *   repositories. The Prisma transaction is rolled back if an operation fails.
 */
export const editTransactions = async (
  payload: EditBulkTransactionsPayload
): Promise<EditTransactionsResult> => {
  const { userId, transactionIds, updates } = toEditAccountCommand(payload);

  return prisma.$transaction(async (tx) => {
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
      const { memo } = updates;
      const selectedTransactionIds = new Set(transactionIds);

      const transactions = [
        ...normalTransactions,
        ...allTransferTransactions,
      ].filter((transaction) => selectedTransactionIds.has(transaction.id));

      const updatedTransactions = await transactionService.bulk.applyMemoChange(
        tx,
        transactions,
        memo
      );

      return {
        updatedAccounts: [],
        updatedTransactions,
        updatedMonths: [],
      };
    }

    // -------------------------
    // MODE: categoryId (exclude transfers)
    // -------------------------
    if (updates.categoryId !== undefined) {
      const categoryId = asCategoryId(updates.categoryId);
      const { updatedMonths, updatedTransactions } =
        await transactionService.bulk.applyCategoryChange(
          tx,
          userId,
          categoryId,
          normalTransactions
        );

      return {
        updatedAccounts: [],
        updatedTransactions,
        updatedMonths,
      };
    }

    // -------------------------
    // MODE: accountId
    // -------------------------
    if (updates.accountId !== undefined) {
      const { accountId } = updates;

      const { updatedAccounts, updatedTransactions } =
        await transactionService.bulk.applyAccountChange(
          tx,
          userId,
          accountId,
          transactionIds,
          normalTransactions,
          allTransferTransactions
        );

      return {
        updatedAccounts,
        updatedTransactions,
        updatedMonths: [],
      };
    }

    throw new NoValidTransactionUpdateOperationError();
  });
};
