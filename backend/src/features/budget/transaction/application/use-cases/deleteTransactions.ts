import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { categoryService } from "../../../category/category.service";
import { transactionService } from "../../transaction.service";
import { type DeleteTransactionsPayload } from "../../transaction.schema";
import { asTransactionId, type TransactionId } from "../../transaction.types";
import { asUserId, UserId } from "../../../../user/auth/auth.types";

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
 * Deletes a set of transactions and updates all related derived state in a single atomic transaction.
 *
 * This function handles both normal (non-transfer) and transfer transactions, including:
 * - Automatically including the paired transfer transaction for any selected transfers.
 * - Updating category months for non-RTA transactions to remove their allocations.
 * - Updating RTA (Ready-To-Assign) months activity and recalculating available amounts.
 * - Adjusting account balances to remove the effects of deleted transactions.
 *
 * All operations are executed within a single Prisma transaction to ensure consistency.
 * If any step fails, the entire deletion is rolled back.
 *
 * @param payload - The delete request payload.
 * @param payload.userId - The ID of the user performing the deletion; used for ownership checks.
 * @param payload.transactionIds - Array of transaction IDs to delete.
 *
 * @returns A promise that resolves once all transactions and related state have been deleted and updated.
 *
 * @throws {NoTransactionsFoundError} If no transactions exist for the provided IDs.
 */
export const deleteTransactions = async (
  payload: DeleteTransactionsPayload
): Promise<void> => {
  const { userId, transactionIds } = toDeleteTransactionsCommand(payload);
  await prisma.$transaction(async (tx) => {
    const { normalTransactions, allTransferTransactions } =
      await transactionService.getTransactionsWithPairs(
        tx,
        userId,
        transactionIds
      );

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
        await categoryService.months.recalculateCategoryMonthsForTransactions(
          tx,
          nonRtaTransactions,
          OperationMode.Delete
        );
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

      await categoryService.rta.calculateMonthsAvailable(
        tx,
        userId,
        rtaCategoryId
      );
    }

    const allTransactionIds = [
      ...normalTransactions,
      ...allTransferTransactions,
    ].map((tx) => tx.id);

    await transactionRepository.deleteTransactions(
      tx,
      allTransactionIds,
      userId
    );

    await accountService.updateAccountBalances(
      tx,
      [...normalTransactions, ...allTransferTransactions],
      OperationMode.Delete
    );
  });
};
