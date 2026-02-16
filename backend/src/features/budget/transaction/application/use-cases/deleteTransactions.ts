import { prisma } from "../../../../../shared/prisma/client";
import { transactionService } from "../../transaction.service";
import { type DeleteTransactionsPayload } from "../../transaction.schema";
import { asTransactionId, type TransactionId } from "../../transaction.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

/**
 * Command type for deleting transactions.
 * All transaction IDs are branded as `TransactionId`.
 */
export type DeleteTransactionsCommand = Omit<
  DeleteTransactionsPayload,
  "userId" | "transactionIds"
> & {
  userId: UserId;
  transactionIds: TransactionId[];
};

/**
 * Converts a raw payload into a typed delete command with branded IDs.
 */
export const toDeleteTransactionsCommand = (
  p: DeleteTransactionsPayload
): DeleteTransactionsCommand => ({
  ...p,
  userId: asUserId(p.userId),
  transactionIds: p.transactionIds.map(asTransactionId),
});

/**
 * Deletes a set of transactions for a given user within a single database transaction.
 *
 * This function acts as an application-layer entry point:
 * - Converts the raw payload into a typed command (brands IDs)
 * - Delegates the deletion logic to `transactionService.deleteTransactionsById`
 * - Ensures the entire operation is executed atomically via `prisma.$transaction`
 *
 * The underlying service is responsible for:
 * - Resolving and deleting both normal and transfer transactions (including pairs)
 * - Updating category months and RTA (Ready To Assign) state
 * - Adjusting account balances and other derived data
 *
 * @param payload - Raw delete payload containing:
 *   - userId: string
 *   - transactionIds: string[]
 *
 * @returns A promise that resolves once deletion and all related side effects are complete
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if none of the provided transaction IDs can be resolved
 *
 * @example
 * await deleteTransactions({
 *   userId: "user-123",
 *   transactionIds: ["tx-1", "tx-2"]
 * });
 */
export const deleteTransactions = async (
  payload: DeleteTransactionsPayload
): Promise<void> => {
  const { userId, transactionIds } = toDeleteTransactionsCommand(payload);
  await prisma.$transaction(async (tx) => {
    await transactionService.deleteTransactionsById(tx, userId, transactionIds);
  });
};
