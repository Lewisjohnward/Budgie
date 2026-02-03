import { Prisma } from "@prisma/client";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryService } from "../../../category.service";
import { aggregateNetActivityByMonth } from "../../../domain/rta.domain";
import { calculateRtaMonthsActivity } from "../../../domain/rta.domain";
import { roundTransactionsToStartOfMonth } from "../../../utils/roundTransactionsToStartOfMonth";
import { type DomainNormalTransaction } from "../../../../transaction/transaction.types";
import { type CategoryId } from "../../../category.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Updates the activity of RTA (Ready-To-Assign) months based on a set of transactions.
 *
 * This function performs the following workflow:
 * 1. Retrieves all RTA months for the specified user and RTA category.
 * 2. Rounds the transaction dates to the start of their respective months.
 * 3. Aggregates net activity changes grouped by month from the given transactions.
 * 4. Calculates the updated activity for each relevant RTA month, applying add or delete logic according to the operation mode.
 * 5. Persists all updated RTA months in the database using the category repository.
 *
 * Use this function to ensure RTA month activity reflects the net effect of transactions,
 * maintaining accurate balances and availability for future allocations.
 *
 * @param prisma - Prisma client or transaction client used for database operations.
 * @param userId - The ID of the user associated with the RTA months.
 * @param rtaCategoryId - The category ID representing the RTA (Ready-To-Assign) category.
 * @param transactions - Array of normal transactions affecting RTA month activity.
 * @param mode - Operation mode indicating whether transactions are being added or removed.
 *
 * @returns A promise that resolves once all affected RTA months have been updated.
 */
export const updateMonthsActivityForTransactions = async (
  prisma: Prisma.TransactionClient,
  userId: UserId,
  rtaCategoryId: CategoryId,
  transactions: DomainNormalTransaction[],
  mode: OperationMode
) => {
  const rtaMonths = await categoryService.months.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId
  );

  const transactionsRoundedToStartOfMonth =
    roundTransactionsToStartOfMonth(transactions);

  const groupedRtaTransactionsByMonth = aggregateNetActivityByMonth(
    transactionsRoundedToStartOfMonth
  );

  // update rta months that have txs that are deleted
  const updatedRtaMonths = calculateRtaMonthsActivity(
    rtaMonths,
    groupedRtaTransactionsByMonth,
    mode
  );

  await categoryRepository.updateMonths(prisma, updatedRtaMonths);
};
