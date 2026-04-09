import { Prisma } from "@prisma/client";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../../category/core/category.service";
import { type DomainNormalTransaction } from "../../../transaction.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { splitTransactionsByType } from "../../../utils/splitTransactionsByType";
import { UpdatedNormalTransactionsNotFoundError } from "../../../transaction.errors";
import { type CategoryId } from "../../../../category/core/category.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Applies a bulk category update to a set of normal (non-transfer) transactions.
 *
 * This function handles both the database update and all downstream side effects
 * related to category month calculations and RTA (Ready To Assign) activity:
 *
 * - Validates that the target category exists and belongs to the user.
 * - Ignores transactions already assigned to the target category.
 * - Updates `categoryId` for the selected transactions in bulk.
 * - Re-fetches the updated transactions to establish the "after" state.
 * - Updates derived month allocations and RTA activity:
 *   - Removes allocations associated with the previous category.
 *   - Adds allocations associated with the new category.
 * - Handles special RTA behavior if the target category is the RTA category.
 *
 * Invariants / Expectations:
 * - `transactions` must only include normal (non-transfer) transactions owned by `userId`.
 * - Transactions represent the "before" state of the transactions being updated.
 * - After the bulk update, all updated transactions must be retrievable as normal
 *   transactions; otherwise an `UpdatedNormalTransactionsNotFoundError` is thrown.
 *
 * All operations are executed using the provided Prisma transaction client and
 * should be called within an existing transaction for atomicity.
 *
 * @param tx - Prisma transaction client for executing all operations atomically.
 * @param userId - ID of the user performing the category update.
 * @param categoryId - Target category ID to assign to the provided transactions.
 * @param transactions - Normal transactions to consider for the category change.
 *                       Transactions already assigned to the target category are ignored.
 *
 * @returns A promise that resolves when all transactions have been updated and
 *          month/RTA side effects applied.
 *
 * @throws {UpdatedNormalTransactionsNotFoundError} Thrown if the updated transactions
 *         cannot all be re-fetched after the bulk update, indicating an invariant violation.
 */
export const applyCategoryChange = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId,
  transactions: DomainNormalTransaction[]
): Promise<void> => {
  if (transactions.length === 0) return;

  const nextCategory = await categoryService.categories.getCategory(
    tx,
    userId,
    categoryId
  );

  // only update transactions that aren't currently assigned to the new category
  const transactionsToChange = transactions.filter(
    (t) => t.categoryId !== nextCategory.id
  );

  // get the ids of the transactions to update
  if (transactionsToChange.length === 0) return;
  const txIdsToChange = transactionsToChange.map((t) => t.id);

  // update categoryId of transactions
  await transactionRepository.bulkUpdateCategoryId(
    tx,
    txIdsToChange,
    nextCategory.id
  );

  // fetch updated transactions
  const updatedTransactions =
    await transactionRepository.getNormalTransactionsByIds(
      tx,
      userId,
      txIdsToChange
    );

  if (updatedTransactions.length !== txIdsToChange.length) {
    throw new UpdatedNormalTransactionsNotFoundError({
      userId,
      expectedCount: txIdsToChange.length,
      actualCount: updatedTransactions.length,
      transactionIds: txIdsToChange,
      categoryId: nextCategory.id,
    });
  }

  // months/RTA side effects based on before/after
  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
    transactionsToChange,
    rtaCategoryId
  );

  // remove previous allocations
  if (rtaTransactions.length > 0) {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      rtaTransactions,
      OperationMode.Delete
    );
  }
  if (nonRtaTransactions.length > 0) {
    await categoryService.months.recalculateCategoryMonthsForTransactions(
      tx,
      nonRtaTransactions,
      OperationMode.Delete
    );
  }

  // recalculate new allocations -
  // don't need to split transactions because they
  // will all have the same categoryId
  if (nextCategory.id === rtaCategoryId) {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      updatedTransactions,
      OperationMode.Add
    );

    // recalculate rta months, doesn't need to be done after category months
    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );
  } else {
    await categoryService.months.recalculateCategoryMonthsForTransactions(
      tx,
      updatedTransactions,
      OperationMode.Add
    );
  }
};
