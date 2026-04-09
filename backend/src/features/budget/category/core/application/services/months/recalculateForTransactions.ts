import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { OperationMode } from "../../../../../../../shared/enums/operation-mode";
import {
  calculateMonthsByCategoryId,
  groupMonthsByCategoryId,
} from "../../../domain/month.domain";
import { groupTransactionsByCategoryId } from "../../../domain/transaction.domain";
import { roundTransactionsToStartOfMonth } from "../../../utils/roundTransactionsToStartOfMonth";
import { type DomainNormalTransaction } from "../../../../../transaction/transaction.types";
import { categoryService } from "../../../category.service";

/**
 * Recalculates and updates category month records based on a set of transactions.
 *
 * This function performs the following workflow:
 * 1. Rounds transaction dates to the start of their respective months.
 * 2. Determines the unique category IDs affected by the transactions.
 * 3. Fetches all category months from the earliest transaction date onward.
 * 4. Groups both months and transactions by category ID.
 * 5. Calculates updated month values according to the operation mode (`Add` or `Delete`).
 * 6. Persists all updated month records in the database in a single batch.
 *
 * Use this function to maintain consistency between transaction activity
 * and category month records, ensuring balances, assignments, or other
 * monthly aggregates remain accurate.
 *
 * @param prisma - Prisma client or transaction client used for database operations.
 * @param transactions - List of normal transactions that affect category months.
 * @param mode - Operation mode indicating whether the transactions are being added or removed.
 *
 * @returns A promise that resolves once all affected category months have been updated.
 */
export const recalculateCategoryMonthsForTransactions = async (
  prisma: Prisma.TransactionClient,
  transactions: DomainNormalTransaction[],
  mode: OperationMode
): Promise<void> => {
  if (transactions.length === 0) return;
  // get the unique category Ids

  // round all txs to start of month
  const transactionsRoundedToStartOfMonth =
    roundTransactionsToStartOfMonth(transactions);

  const transactionCategoryIds = [
    ...new Set(transactionsRoundedToStartOfMonth.map((t) => t.categoryId)),
  ];

  // get the earliest month that needs updating
  const earliestMonthToUpdate = transactionsRoundedToStartOfMonth[0].date;

  // get all category months from date
  const categoryMonths =
    await categoryService.months.getMonthsForCategoriesStartingFrom(
      prisma,
      transactionCategoryIds,
      earliestMonthToUpdate
    );

  // group months by categoryId
  const monthsGroupedByCategoryId = groupMonthsByCategoryId(categoryMonths);

  // group categorised txs by category id
  const categorisedTransactionsGroupedByCategoryId =
    groupTransactionsByCategoryId(transactionsRoundedToStartOfMonth);

  // calculate updated months by categoryId
  const updatedMonthsByCategoryId = calculateMonthsByCategoryId(
    categorisedTransactionsGroupedByCategoryId,
    monthsGroupedByCategoryId,
    mode
  );

  // Flatten all updated months from the map into a single array
  const allUpdatedMonths = Object.values(updatedMonthsByCategoryId).flat();

  // Call the repository method once with all updated months
  await categoryRepository.updateMonths(prisma, allUpdatedMonths);
};
