import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { categoryService } from "../../../category/category.service";
import { transactionService } from "../../transaction.service";
import { DeleteTransactionPayload } from "../../transaction.schema";

/**
 * Deletes transactions and handles all related data updates in a single transaction.
 *
 * This function:
 * 1. Retrieves the transactions to be deleted
 * 2. Handles transfer transactions by finding their pairs
 * 3. For non-transfer transactions:
 *    - Updates category months (for non-RTA transactions)
 *    - Updates RTA (Ready To Assign) activity and available amounts
 * 4. Deletes all transactions (both regular and their transfer pairs)
 * 5. Updates account balances for all affected accounts
 *
 * @param {DeleteTransactionPayload} payload - The payload containing:
 *   - userId: string - ID of the user performing the deletion
 *   - transactionIds: string[] - Array of transaction IDs to be deleted
 *
 * @throws {NoTransactionsFoundError} If no transactions are found with the provided IDs
 *
 * @example
 * await deleteTransactions({
 *   userId: 'user-123',
 *   transactionIds: ['tx-1', 'tx-2']
 * });
 */

export const deleteTransactions = async (payload: DeleteTransactionPayload) => {
  const { userId, transactionIds } = payload;
  await prisma.$transaction(async (tx) => {
    const { normalTransactions, allTransferTransactions } =
      await transactionService.getTransactionsWithPairs(
        tx,
        userId,
        transactionIds
      );

    if (normalTransactions.length > 0) {
      const rtaCategoryId = await categoryRepository.getRtaCategoryId(
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
