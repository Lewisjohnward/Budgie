import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";

/**
 * Updates the payee ID for all transactions associated with one or more payees.
 *
 * This service is used when a payee is being deleted and its transactions need to be
 * reassigned to another payee or have their payee association removed.
 *
 * @param tx - The Prisma transaction client to use for database operations
 * @param userId - The ID of the user who owns the transactions (for security validation)
 * @param payeeId - The ID(s) of the payee(s) whose transactions need to be updated
 * @param newPayeeId - The ID of the replacement payee, or null to remove the payee association
 *
 * @example
 * // Reassign transactions from payee1 to payee2
 * await updatePayeeForTransactions(tx, 'user-id', 'payee1-id', 'payee2-id');
 *
 * // Remove payee association from transactions
 * await updatePayeeForTransactions(tx, 'user-id', 'payee1-id', null);
 *
 * // Bulk update multiple payees
 * await updatePayeeForTransactions(tx, 'user-id', ['payee1-id', 'payee2-id'], 'payee3-id');
 */

export const updatePayeeForTransactions = async (
  tx: Prisma.TransactionClient,
  userId: string,
  payeeId: string | string[],
  newPayeeId: string | null
): Promise<void> => {
  await transactionRepository.updateTransactionsPayee(
    tx,
    userId,
    payeeId,
    newPayeeId
  );
};
