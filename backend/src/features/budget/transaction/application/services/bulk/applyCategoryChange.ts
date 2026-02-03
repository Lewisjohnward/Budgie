import { Prisma } from "@prisma/client";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../../category/category.service";
import { NormalTransactionEntity } from "../../../transaction.types";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { splitTransactionsByType } from "../../../utils/splitTransactionsByType";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { UpdatedNormalTransactionsNotFoundError } from "../../../transaction.errors";

/**
 * Applies a bulk category change to a set of normal (non-transfer) transactions
 * and updates all derived category month state based on the before/after change.
 *
 * Behaviour:
 * - Validates that the target category exists and is owned by the user
 * - Filters out transactions that are already assigned to the target category
 * - Performs a bulk update of `categoryId` for the remaining transactions
 * - Re-fetches the updated transactions to establish the "after" state
 * - Updates category month activity by:
 *   - removing allocations associated with the previous category
 *   - adding allocations associated with the new category
 * - Applies special handling when the target category is the
 *   "Ready To Assign" (RTA) category
 *
 * Expectations / invariants:
 * - `transactions` must contain only normal (non-transfer) transactions owned
 *   by `userId`
 * - `transactions` represent the "before" state for the same transaction IDs
 *   being updated
 * - After the bulk update, all updated transactions must be re-fetchable as
 *   normal transactions; otherwise an invariant error is thrown
 *
 * All database operations are executed using the provided Prisma transaction
 * client and must be called from within an existing transaction.
 *
 * @param {Prisma.TransactionClient} tx
 *        Prisma transaction client. All operations are executed within this
 *        transaction scope.
 * @param {string} userId
 *        User performing the bulk category change. Used for category ownership
 *        checks and derived month updates.
 * @param {string} categoryId
 *        Target category ID to assign to the provided transactions.
 * @param {NormalTransactionEntity[]} transactions
 *        Normal transactions to consider for the category change ("before" state).
 *        Transactions already assigned to the target category are ignored.
 *
 * @returns {Promise<void>}
 *
 * @throws {UpdatedNormalTransactionsNotFoundError}
 * Thrown if the updated transactions cannot all be re-fetched as normal
 * transactions after the bulk update, indicating an invariant violation.
 */

export const applyCategoryChange = async (
  tx: Prisma.TransactionClient,
  userId: string,
  categoryId: string,
  transactions: NormalTransactionEntity[]
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
  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

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
