import { Prisma } from "@prisma/client";
import { UserId } from "../../../../user/auth/auth.types";
import { AccountId } from "../../../account/account.types";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { asTransactionId } from "../../transaction.types";
import { transactionService } from "../../transaction.service";

/**
 * Deletes all transactions associated with a given account.
 *
 * This function retrieves all transaction IDs linked to the account
 * and then deletes them using the transaction service. The operation
 * should be executed within a database transaction to maintain consistency.
 *
 * @param tx - Prisma transaction client used for all database operations
 * @param userId - ID of the user who owns the account
 * @param accountId - ID of the account whose transactions should be deleted
 *
 * @returns A promise that resolves when all transactions for the account have been deleted
 */
export const deleteTransactionsByAccountId = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountId: AccountId
) => {
  const rawTransactionIds =
    await transactionRepository.getTransactionIdsByAccountId(tx, accountId);

  const txIds = rawTransactionIds.map((id) => asTransactionId(id));

  await transactionService.deleteTransactionsById(tx, userId, txIds);
};
