import { Prisma } from "@prisma/client";
import { OperationMode } from "../../../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../../category/core/category.service";
import { type DomainNormalTransaction } from "../../../transaction.types";
import { transactionRepository } from "../../../../../../../shared/repository/transactionRepositoryImpl";
import { splitTransactionsByType } from "../../../utils/splitTransactionsByType";
import { UpdatedNormalTransactionsNotFoundError } from "../../../transaction.errors";
import {
  type DomainMonth,
  type CategoryId,
} from "../../../../category/core/category.types";
import { type UserId } from "../../../../../../user/auth/auth.types";

type ApplyCategoryChangeResult = {
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainNormalTransaction[];
};

const noOpResult: ApplyCategoryChangeResult = {
  updatedMonths: [],
  updatedTransactions: [],
};

/**
 * Applies a bulk category change to a collection of normal (non-transfer)
 * transactions and recalculates the affected category months and RTA availability.
 *
 * All database operations and derived month calculations are performed within
 * the provided Prisma transaction client (`tx`) and should be committed or
 * rolled back atomically by the caller.
 *
 * The function performs the following steps:
 *
 * 1. Returns an empty result if no transactions were supplied.
 *
 * 2. Retrieves the destination category belonging to the specified user.
 *
 * 3. Filters out transactions already assigned to the destination category.
 *    Returns an empty result if no transactions require updating.
 *
 * 4. Updates the category ID of the remaining transactions.
 *
 * 5. Retrieves the updated normal transactions and validates that all expected
 *    transactions were successfully retrieved.
 *
 * 6. Identifies the RTA category and splits the pre-update transactions into
 *    RTA and non-RTA transactions.
 *
 * 7. Removes allocations from the previous categories:
 *    - Removes activity from RTA if any transactions previously belonged to RTA.
 *    - Recalculates category months for transactions previously assigned to
 *      non-RTA categories.
 *
 * 8. Applies allocations to the destination category:
 *    - Updates RTA activity if the destination category is RTA.
 *    - Otherwise, recalculates category months for the updated transactions.
 *
 * 9. Recalculates RTA availability if RTA was either the previous category
 *    for any transaction or the destination category.
 *
 * 10. Deduplicates the affected months by month ID, retaining the latest
 *     recalculated result for each month.
 *
 * RTA handling:
 * - Transactions previously assigned to RTA have their RTA activity removed.
 * - Transactions moved into RTA have their RTA activity added.
 * - RTA availability is recalculated only when RTA is affected by the change.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param userId - ID of the user whose transactions and categories are being modified.
 * @param categoryId - ID of the destination category.
 * @param transactions - Pre-update normal transactions selected for the category
 *   change. Transactions already assigned to the destination category are ignored.
 *
 * @throws {UpdatedNormalTransactionsNotFoundError}
 * Thrown when the number of updated transactions retrieved does not match
 * the number of transactions expected after the category update.
 *
 * @returns A promise resolving to the updated normal transactions and the
 * unique affected months containing their final recalculated state.
 * Returns empty arrays if no transactions require updating.
 */
export const applyCategoryChange = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId,
  transactions: DomainNormalTransaction[]
): Promise<ApplyCategoryChangeResult> => {
  if (transactions.length === 0) return noOpResult;

  const nextCategory = await categoryService.categories.getCategory(
    tx,
    userId,
    categoryId
  );

  const transactionsToChange = transactions.filter(
    (t) => t.categoryId !== nextCategory.id
  );

  if (transactionsToChange.length === 0) return noOpResult;

  const txIdsToChange = transactionsToChange.map((t) => t.id);

  await transactionRepository.bulkUpdateCategoryId(
    tx,
    txIdsToChange,
    nextCategory.id
  );

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

  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
    transactionsToChange,
    rtaCategoryId
  );

  const wasRta = rtaTransactions.length > 0;
  const isNowRta = nextCategory.id === rtaCategoryId;

  const affectedMonths: DomainMonth[] = [];

  // Remove allocations from the previous categories.
  if (wasRta) {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      rtaTransactions,
      OperationMode.Delete
    );
  }

  if (nonRtaTransactions.length > 0) {
    const deletedMonths =
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        nonRtaTransactions,
        OperationMode.Delete
      );

    affectedMonths.push(...deletedMonths);
  }

  // Add allocations to the destination category.
  if (isNowRta) {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      updatedTransactions,
      OperationMode.Add
    );
  } else {
    const addedMonths =
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        updatedTransactions,
        OperationMode.Add
      );

    affectedMonths.push(...addedMonths);
  }

  // Recalculate RTA availability only when RTA was affected.
  if (wasRta || isNowRta) {
    const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );

    affectedMonths.push(...updatedRtaMonths);
  }

  return {
    updatedMonths: [
      ...new Map(affectedMonths.map((month) => [month.id, month])).values(),
    ],
    updatedTransactions,
  };
};
