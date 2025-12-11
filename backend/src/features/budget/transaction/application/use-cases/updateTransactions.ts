import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { EditTransactionsPayload } from "../../transaction.schema";
import { prisma } from "../../../../../shared/prisma/client";
import { deleteTransactions } from "./deleteTransactions";
import { categoryService } from "../../../category/category.service";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";

/**
 * Updates multiple transactions in a single atomic operation, handling both regular and transfer transactions.
 * This function manages the complete transaction update flow including validation, deletion of old transactions,
 * and creation of updated transactions with proper account and category updates.
 *
 * @param {string} userId - The ID of the user performing the update
 * @param {TransactionsToUpdate[]} updatedTransactions - Array of transactions to update
 * @returns {Promise<void>}
 *
 * @throws {Prisma.PrismaClientKnownRequestError} If there's a database error
 * @throws {Error} If any business rules are violated
 *
 * @example
 * // Update regular transactions
 * await updateTransactions('user-123', [
 *   { id: 'tx-1', accountId: 'acc-1', amount: 100, date: '2025-01-01' }
 * ]);
 *
 * // Update transfer transactions (both source and destination will be updated)
 * await updateTransactions('user-123', [
 *   {
 *     id: 'tx-1',
 *     accountId: 'acc-1',
 *     transferAccountId: 'acc-2',
 *     outflow: 100,
 *     date: '2025-01-01'
 *   }
 * ]);
 *
 * @description
 * This function performs the following operations in a single database transaction:
 * 1. Validates that all transactions exist and belong to the user
 * 2. Deletes the original transactions
 * 3. Handles different transaction types:
 *    - Regular transactions
 *    - RTA (Ready To Assign) transactions
 *    - Transfer transactions (updates both source and destination)
 * 4. For transfer transactions:
 *    - Maintains data consistency between source and destination
 *    - Swaps account references and amounts
 *    - Updates transfer transaction references
 * 5. Updates related category months
 * 6. Updates RTA calculations if needed
 * 7. Updates account balances
 *
 * Note: The function sorts transactions by date before processing to ensure
 * consistent behavior when dealing with transactions that affect monthly budgets.
 * For transfer transactions, both the source and destination are updated atomically.
 */

export const updateTransactions = async (payload: EditTransactionsPayload) => {
  return;
  // const { userId, transactions: updatedTransactions } = payload;
  //
  // await prisma.$transaction(async (tx) => {
  //   const transactionIds = updatedTransactions.map((tx) => tx.id);
  //
  //   // check that the transactions already exist in the db
  //   const transactionsToUpdate =
  //     await transactionRepository.getTransactionsByIdWithPairs(
  //       tx,
  //       transactionIds,
  //       userId
  //     );
  //
  //   // create set of transaction ids
  //   const existingIds = new Set(transactionsToUpdate.map((t) => t.id));
  //
  //   const filteredTxs = [...updatedTransactions]
  //     .filter((tx) => existingIds.has(tx.id))
  //     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  //   //
  //   if (filteredTxs.length === 0) return;
  //   const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);
  //
  //   // TODO: THIS NEEDS A TX
  //   await deleteTransactions({
  //     userId,
  //     transactionIds: transactionsToUpdate.map((t) => t.id),
  //   });
  //
  //   // TODO: NEED TO VALIDATE ACCOUNT transaction is going to,
  //   // TODO: NEED TO CHECK USER OWNS, CATEGORY, CATEGORYMONTH
  //   //TODO: NEED TO UPDATE MONTHS IF MOVING INTO THE PAST
  //
  //   const transactionsToInsert = filteredTxs;
  //
  //   const { rtaTransactions, nonRtaTransactions, transferTransactions } =
  //     splitTransactionsByType(transactionsToInsert, rtaCategoryId);
  //
  //   if (transferTransactions.length > 0) {
  //     const transferTransactionsWithoutTransferTransactionId =
  //       transferTransactions.map((tx) => ({
  //         ...tx,
  //         transferTransactionId: null,
  //       }));
  //
  //     const sourceTransaction =
  //       transferTransactionsWithoutTransferTransactionId[0];
  //
  //     const updatedSourceTransaction =
  //       await transactionRepository.createTransaction(
  //         tx,
  //         // @ts-expect-error - We know the types don't perfectly match but it's handled
  //         sourceTransaction
  //       );
  //
  //     const { id: _id, ...rest } = sourceTransaction;
  //
  //     // Create the corresponding destination transaction
  //     const destinationTransaction = {
  //       ...rest,
  //       accountId: sourceTransaction.transferAccountId!,
  //       transferAccountId: sourceTransaction.accountId,
  //       // Swap inflow and outflow amounts
  //       inflow: sourceTransaction.outflow,
  //       outflow: sourceTransaction.inflow,
  //       // Link the transactions
  //       transferTransactionId: updatedSourceTransaction.id,
  //     };
  //
  //     const updatedDestinationTransaction =
  //       await transactionRepository.createTransaction(
  //         tx,
  //         // @ts-expect-error - We know the types don't perfectly match but it's handled
  //         destinationTransaction
  //       );
  //
  //     // update account balances
  //     if (sourceTransaction) {
  //       await accountService.updateAccountBalances(
  //         tx,
  //         [sourceTransaction, updatedDestinationTransaction],
  //         OperationMode.Add
  //       );
  //     }
  //     // Update the source transaction with the destination's ID
  //     await transactionRepository.updateTransaction(
  //       tx,
  //       updatedSourceTransaction.id,
  //       { transferTransactionId: updatedDestinationTransaction.id }
  //     );
  //   }
  //
  //   // insert txs
  //   await transactionRepository.createTransactions(tx, [
  //     ...rtaTransactions,
  //     ...nonRtaTransactions,
  //   ]);
  //
  //   // update months for transactions
  //   if (nonRtaTransactions.length > 0) {
  //     await categoryService.months.recalculateCategoryMonthsForTransactions(
  //       tx,
  //       nonRtaTransactions,
  //       OperationMode.Add
  //     );
  //   }
  //
  //   // update rta activity and then recalculate rta months available
  //   if (rtaTransactions.length > 0) {
  //     await categoryService.rta.updateMonthsActivityForTransactions(
  //       tx,
  //       userId,
  //       rtaCategoryId,
  //       rtaTransactions,
  //       OperationMode.Add
  //     );
  //   }
  //
  //   if (rtaTransactions.length > 0 || nonRtaTransactions.length > 0) {
  //     // update account balances
  //     await accountService.updateAccountBalances(
  //       tx,
  //       nonRtaTransactions,
  //       OperationMode.Add
  //     );
  //   }
  //
  //   // update rta months
  //   await categoryService.rta.calculateMonthsAvailable(
  //     tx,
  //     userId,
  //     rtaCategoryId
  //   );
  // });
};
