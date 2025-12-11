import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { categoryService } from "../../../category/category.service";
import { transactionService } from "../../transaction.service";
import { createDuplicatedTxs } from "../../utils/createDuplicateTxs";
import { duplicateTransferTransactions } from "../../utils/duplicateTransferTransactions";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { DuplicateTransactionsPayload } from "../../transaction.schema";

/**
 * Creates duplicates of specified transactions while maintaining their relationships and updating all necessary data.
 *
 * This function:
 * 1. Retrieves the transactions to be duplicated
 * 2. Handles different types of transactions:
 *    - Regular transactions
 *    - RTA (Ready To Assign) transactions
 *    - Transfer transactions (including both sides of the transfer)
 * 3. Creates new transactions with updated IDs and timestamps
 * 4. Maintains transaction relationships and references
 * 5. Updates category months and RTA calculations
 * 6. Updates account balances
 *
 * @param {DuplicateTransactionsPayload} payload - The payload containing:
 *   - userId: string - ID of the user performing the duplication
 *   - transactionIds: string[] - Array of transaction IDs to be duplicated
 *
 * @throws {NoTransactionsFoundError} If no transactions are found with the provided IDs
 *
 * @example
 * await duplicateTransactions({
 *   userId: 'user-123',
 *   transactionIds: ['tx-1', 'tx-2']
 * });
 *
 * @returns {Promise<void>} Resolves when all transactions have been duplicated and related data has been updated
 */

export const duplicateTransactions = async (
  payload: DuplicateTransactionsPayload
) => {
  const { userId, transactionIds } = payload;

  await prisma.$transaction(async (tx) => {
    const { normalTransactions, allTransferTransactions } =
      await transactionService.getTransactionsWithPairs(
        tx,
        userId,
        transactionIds
      );

    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    const duplicatedTransferTxs = duplicateTransferTransactions(
      allTransferTransactions
    );

    const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
      normalTransactions,
      rtaCategoryId
    );

    const nonRtaTxsWithoutIds = createDuplicatedTxs(nonRtaTransactions);
    const rtaTxsWithoutIds = createDuplicatedTxs(rtaTransactions);

    // handle non transfer transactions
    if (normalTransactions.length > 0) {
      // update months for duplicated transactions
      if (nonRtaTransactions.length > 0) {
        await categoryService.months.recalculateCategoryMonthsForTransactions(
          tx,
          nonRtaTransactions,
          OperationMode.Add
        );
      }

      // update rta activity and then recalculate rta months available
      if (rtaTransactions.length > 0) {
        await categoryService.rta.updateMonthsActivityForTransactions(
          tx,
          userId,
          rtaCategoryId,
          rtaTransactions,
          OperationMode.Add
        );
      }

      await categoryService.rta.calculateMonthsAvailable(
        tx,
        userId,
        rtaCategoryId
      );
    }

    // Insert all transactions
    await transactionRepository.createTransactions(tx, [
      ...duplicatedTransferTxs,
      ...rtaTxsWithoutIds,
      ...nonRtaTxsWithoutIds,
    ]);

    // Update account balances for the duplicated transfers
    await accountService.updateAccountBalances(
      tx,
      [...duplicatedTransferTxs, ...rtaTransactions, ...nonRtaTransactions],
      OperationMode.Add
    );
  });
};
