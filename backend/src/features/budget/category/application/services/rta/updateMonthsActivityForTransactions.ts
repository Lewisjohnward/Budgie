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

import { Prisma, PrismaClient, Transaction } from "@prisma/client";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { aggregateNetActivityByMonth } from "../../../domain/rta.domain";
import { calculateRtaMonthsActivity } from "../../../domain/rta.domain";
import { roundTransactionsToStartOfMonth } from "../../../utils/roundTransactionsToStartOfMonth";

export const updateMonthsActivityForTransactions = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
  transactions: (Omit<Transaction, "id"> & { id?: string })[],
  mode: OperationMode,
) => {
  // TODO: THIS CAN BE OPTIMISED, ONLY NEED FROM EARLIEST DATE OF TRANSACTION[]
  const rtaMonths = await categoryRepository.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId,
  );
  const transactionsRoundedToStartOfMonth =
    roundTransactionsToStartOfMonth(transactions);

  const groupedRtaTransactionsByMonth = aggregateNetActivityByMonth(
    transactionsRoundedToStartOfMonth,
  );

  // update rta months that have txs that are deleted
  const updatedRtaMonths = calculateRtaMonthsActivity(
    rtaMonths,
    groupedRtaTransactionsByMonth,
    mode,
  );

  await categoryRepository.updateMonths(prisma, updatedRtaMonths);
};
