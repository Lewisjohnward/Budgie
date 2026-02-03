import { prisma } from "../../../../../shared/prisma/client";
import { asUserId, UserId } from "../../../../user/auth/auth.types";
import { type AccountId, asAccountId } from "../../../account/account.types";
import { asCategoryId } from "../../../category/category.types";
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
 * Applies bulk updates to a set of transactions for a given user.
 * This function orchestrates the update logic based on the provided fields,
 * handling memos, category changes, and account moves within a single database transaction.
 *
 * @param userId The ID of the user performing the update.
 * @param payload The payload containing transaction IDs and the updates to apply.
 */
export const editTransactions = async (
  payload: EditBulkTransactionsPayload
) => {
  const { userId, transactionIds, updates } = toEditAccountCommand(payload);

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
        asCategoryId(updates.categoryId),
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
    }
  });
};
