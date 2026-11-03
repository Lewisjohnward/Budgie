import { Prisma } from "@prisma/client";
import { UserId } from "../../../../../user/auth/auth.types";
import {
  type DomainTransaction,
  type TransactionId,
} from "../../transaction.types";
import { transactionService } from "../../transaction.service";
import { categoryService } from "../../../category/core/category.service";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { getUniqueAccountIds } from "../../utils/getUniqueAccountIds";
import { type DomainMonth } from "../../../category/core/category.types";
import { type DomainAccount } from "../../../account/account.types";

type DeleteTransactionsIdResult = {
  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  deletedTransactions: DomainTransaction[];
};

/**
 * Deletes transactions and their transfer counterparts, updating all affected
 * account balances and budget month aggregates.
 *
 * Resolves the complete set of transactions to delete, including transfer
 * counterparts, and performs the following operations:
 *
 * 1. Splits normal transactions into RTA (Ready To Assign) and non-RTA
 *    transactions.
 * 2. Recalculates affected category months for non-RTA transactions.
 * 3. Updates RTA activity and recalculates available amounts.
 * 4. Deletes all resolved transactions from the database.
 * 5. Updates account balances to reflect the deleted transactions.
 * 6. Refreshes account deletable status.
 * 7. Retrieves the updated accounts for the affected account IDs.
 *
 * Returns the deleted transactions and updated domain entities, allowing
 * the caller to construct a response that synchronises client state without
 * requiring a full refetch.
 *
 * This function must be executed within an existing Prisma transaction to
 * ensure all database changes are atomic.
 *
 * @param tx - Prisma transaction client used to ensure atomicity.
 * @param userId - ID of the user who owns the transactions.
 * @param transactionIds - IDs of the transactions to delete. Transfer
 * counterparts are resolved automatically.
 *
 * @returns The deleted transactions, updated accounts and updated months.
 *
 * @throws {NoTransactionsFoundError} If none of the provided transaction IDs
 * can be resolved.
 */
export const deleteTransactionsById = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  transactionIds: TransactionId[]
): Promise<DeleteTransactionsIdResult> => {
  const { normalTransactions, allTransferTransactions } =
    await transactionService.getTransactionsWithPairs(
      tx,
      userId,
      transactionIds
    );

  const updatedMonths: DomainMonth[] = [];

  if (normalTransactions.length > 0) {
    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
      normalTransactions,
      rtaCategoryId
    );

    // update months for deleted transactions
    if (nonRtaTransactions.length > 0) {
      const updatedNonRtaMonths =
        await categoryService.months.recalculateCategoryMonthsForTransactions(
          tx,
          nonRtaTransactions,
          OperationMode.Delete
        );
      updatedMonths.push(...updatedNonRtaMonths);
    }

    // update rta activity for deleted transactions
    if (rtaTransactions.length > 0) {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Delete
      );
    }

    const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );

    updatedMonths.push(...updatedRtaMonths);
  }

  const allTransactionIds = [
    ...normalTransactions,
    ...allTransferTransactions,
  ].map((tx) => tx.id);

  await transactionRepository.deleteTransactions(tx, allTransactionIds, userId);

  await accountService.updateAccountBalances(
    tx,
    [...normalTransactions, ...allTransferTransactions],
    OperationMode.Delete
  );

  const uniqueAccountIds = getUniqueAccountIds([
    ...normalTransactions,
    ...allTransferTransactions,
  ]);

  await accountService.refreshDeletableStatus(tx, uniqueAccountIds);

  const updatedAccounts = await accountService.getAccountsByIds(
    tx,
    userId,
    uniqueAccountIds
  );

  return {
    updatedMonths,
    updatedAccounts,
    deletedTransactions: [...normalTransactions, ...allTransferTransactions],
  };
};
