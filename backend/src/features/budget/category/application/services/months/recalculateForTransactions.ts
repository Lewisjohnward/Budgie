import { Prisma, PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import {
  calculateMonthsByCategoryId,
  groupMonthsByCategoryId,
} from "../../../domain/month.domain";
import { groupTransactionsByCategoryId } from "../../../domain/transaction.domain";
import { roundTransactionsToStartOfMonth } from "../../../utils/roundTransactionsToStartOfMonth";
import { NormalTransactionEntity } from "../../../../transaction/transaction.types";

/**
 * Updates category month records based on multiple transactions.
 *
 * - Rounds transactions' dates to the start of their respective months.
 * - Retrieves all category months from the earliest transaction date.
 * - Groups months and transactions by category ID.
 * - Calculates updated month values based on the transactions and operation mode (Add/Delete).
 * - Updates the database with all modified month records
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param transactions - List of transactions affecting category months.
 * @param mode - Operation mode specifying whether transactions are added or deleted.
 */

export const recalculateCategoryMonthsForTransactions = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  transactions: NormalTransactionEntity[],
  mode: OperationMode
) => {
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
    await categoryRepository.getMonthsForCategoriesStartingFrom(
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
