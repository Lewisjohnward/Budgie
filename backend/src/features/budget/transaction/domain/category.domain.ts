import { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { roundToStartOfMonth } from "../../../../shared/utils/roundToStartOfMonth";
import { getIntermediateMonths } from "../utils/getIntermediateMonths";
import { ZERO } from "../../../../shared/constants/zero";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import { roundTransactionsToStartOfMonth } from "../utils/roundTransactionsToStartOfMonth";
import { groupMonthsByCategoryId } from "../utils/groupMonthsByCategoryId";
import { calculateMonthsByCategoryId } from "../utils/calculateMonthsByCategoryId";
import { groupTransactionsByCategoryId } from "../utils/groupTransactionsByCategoryId";
import { OperationMode } from "../../../../shared/enums/operation-mode";

/**
 * Inserts missing months into the budget for all categories, ensuring continuity
 * of monthly records from the provided transaction date back to the earliest existing month.
 *
 * - Fetches existing months and determines the earliest month.
 * - Calculates any missing months between the given transaction date and earliest month.
 * - For each category and missing month (up to a max limit), prepares zeroed month entries.
 * - Inserts these missing month entries into the database via the budget repository.
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param userId - The user identifier for whom months are managed.
 * @param transactionDate - The date of the new transaction triggering this check.
 */

const MAX_MONTHS = 12;
export const insertMissingMonths = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  transactionDate: Date,
) => {
  const existingMonths = await budgetRepository.getPastMonths(prisma, userId);

  const earliestMonth = roundToStartOfMonth(
    existingMonths.reduce(
      (min, { month }) => (month < min ? month : min),
      new Date(),
    ),
  );

  const missingMonths = getIntermediateMonths(transactionDate, earliestMonth);

  const categories = await budgetRepository.getAllCategoryIds(prisma, userId);

  const recentMonths = missingMonths.slice(-MAX_MONTHS);
  const monthEntries: Prisma.MonthCreateManyInput[] = [];

  for (const category of categories) {
    for (const month of recentMonths) {
      monthEntries.push({
        categoryId: category.id,
        month,
        activity: ZERO,
        assigned: ZERO,
      });
    }
  }

  if (monthEntries.length > 0) {
    budgetRepository.createMissingMonths(prisma, monthEntries);
  }
};

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

export const updateCategoryMonthsForMutipleTransactions = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  transactions: (Omit<Transaction, "id"> & { id?: string })[],
  mode: OperationMode,
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
  const categoryMonths = await budgetRepository.getCategoryMonthsFromDate(
    prisma,
    transactionCategoryIds,
    earliestMonthToUpdate,
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
    mode,
  );

  // Flatten all updated months from the map into a single array
  const allUpdatedMonths = Object.values(updatedMonthsByCategoryId).flat();

  // Call the repository method once with all updated months
  await budgetRepository.updateCategoryMonths(prisma, allUpdatedMonths);
};
