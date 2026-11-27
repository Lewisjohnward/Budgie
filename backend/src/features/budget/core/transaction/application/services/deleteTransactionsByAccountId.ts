import { Prisma } from "@prisma/client";
import { UserId } from "../../../../../user/auth/auth.types";
import { AccountId } from "../../../account/account.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { type DomainNormalTransaction } from "../../transaction.types";
import { transactionService } from "../../transaction.service";
import { transactionMapper } from "../../transaction.mapper";
import { type DomainMonth } from "../../../category/core/category.types";

type DeleteTransactionsByAccountIdResult = {
  deletedTransactions: DomainNormalTransaction[];
  updatedMonths: DomainMonth[];
};

/**
 * Deletes all transactions associated with a given account.
 *
 * Retrieves all transactions linked to the account, maps them to domain
 * transactions, and deletes them via the transaction service.
 *
 * Returns the deleted transactions and the budget months whose aggregates
 * were affected by the deletion.
 *
 * @param tx - Prisma transaction client used for all database operations
 * @param userId - ID of the user who owns the account
 * @param accountId - ID of the account whose transactions should be deleted
 *
 * @returns An object containing the deleted domain transactions and updated
 * budget months.
 */
export const deleteTransactionsByAccountId = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountId: AccountId
): Promise<DeleteTransactionsByAccountIdResult> => {
  const rawTransactions =
    await transactionRepository.getTransactionsByAccountId(tx, accountId);

  const transactions = rawTransactions.map(
    transactionMapper.toDomainNormalTransaction
  );

  const txIds = transactions.map((tx) => tx.id);

  const result = await transactionService.deleteTransactionsById(
    tx,
    userId,
    txIds
  );

  return {
    deletedTransactions: transactions,
    updatedMonths: result.updatedMonths,
  };
};
