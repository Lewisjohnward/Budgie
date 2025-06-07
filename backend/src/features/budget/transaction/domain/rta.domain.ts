import { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { groupMonthlyAssignedNegativeAvailable } from "../../../../shared/utils/groupMonthlyAssignedNegativeAvailable";
import { calculateRtaAvailablePerMonth } from "../../../../shared/utils/calculateRtaAvailablePerMonth";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import { aggregateNetActivityByMonth } from "../utils/aggregateNetActivityByMonth";
import { calculateRtaMonthsActivity } from "../utils/calculateRtaMonthsActivity";
import { roundTransactionsToStartOfMonth } from "../utils/roundTransactionsToStartOfMonth";
import { OperationMode } from "../../../../shared/enums/operation-mode";

/**
 * Calculates and updates the available amounts for RTA (Ready-To-Assign) months for a given user and category.
 *
 * - Fetches all category months and RTA months for the specified user and category.
 * - Groups category months to determine the total negative assigned amounts per month.
 * - Calculates updated available amounts for each RTA month based on the grouped data.
 * - Persists the updated RTA month records to the database via the budget repository.
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param userId - The user identifier for whom the RTA months are calculated.
 * @param rtaCategoryId - The category ID representing RTA months.
 */

export const calculateRtaMonthsAvailable = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
) => {
  const allCategoryMonths = await budgetRepository.getAllCategoryMonths(
    prisma,
    userId,
    rtaCategoryId,
  );
  // get all (updated) rta months
  const allRtaMonths = await budgetRepository.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId,
  );
  // group category groups by total negative per month
  const monthlyAssignedNegativeAvailable =
    groupMonthlyAssignedNegativeAvailable(allCategoryMonths);

  // calculate rta available per month
  const updatedRtaMonths = calculateRtaAvailablePerMonth(
    allRtaMonths,
    monthlyAssignedNegativeAvailable,
  );

  // update rta months
  await budgetRepository.updateRtaMonths(prisma, updatedRtaMonths);
};

/**
 * Updates the activity field of RTA (Ready-To-Assign) months based on a set of transactions and operation mode.
 *
 * - Retrieves all RTA months for the given user and category.
 * - Rounds transaction dates to the start of their respective months.
 * - Aggregates net activity changes grouped by month from the transactions.
 * - Calculates updated activity values for each relevant RTA month, applying add or delete logic.
 * - Persists the updated RTA months using the budget repository.
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param userId - The user ID associated with the RTA months.
 * @param rtaCategoryId - The category ID representing RTA months.
 * @param rtaTransactions - The transactions affecting RTA month activities.
 * @param mode - Operation mode indicating whether transactions are added or deleted.
 */

export const updateRtaMonthsActivity = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
  rtaTransactions: (Omit<Transaction, "id"> & { id?: string })[],
  mode: OperationMode,
) => {
  // TODO: THIS CAN BE OPTIMISED, ONLY NEED FROM EARLIEST DATE OF TRANSACTION[]
  const rtaMonths = await budgetRepository.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId,
  );
  const transactionsRoundedToStartOfMonth =
    roundTransactionsToStartOfMonth(rtaTransactions);

  const groupedRtaTransactionsByMonth = aggregateNetActivityByMonth(
    transactionsRoundedToStartOfMonth,
  );

  // update rta months that have txs that are deleted
  const updatedRtaMonths = calculateRtaMonthsActivity(
    rtaMonths,
    groupedRtaTransactionsByMonth,
    mode,
  );

  await budgetRepository.updateRtaMonths(prisma, updatedRtaMonths);
};
