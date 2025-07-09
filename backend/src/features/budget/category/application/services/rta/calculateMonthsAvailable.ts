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

import { Prisma, PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { groupMonthlyAssignedNegativeAvailable } from "../../../../../../shared/utils/groupMonthlyAssignedNegativeAvailable";
import { calculateRtaAvailablePerMonth } from "../../../domain/rta.domain";

export const calculateMonthsAvailable = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
  rtaCategoryId: string,
) => {
  const allCategoryMonths = await categoryRepository.getAllMonthsForCategories(
    prisma,
    userId,
    rtaCategoryId,
  );
  // get all (updated) rta months
  const allRtaMonths = await categoryRepository.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId,
  );
  // group category groups by total negative per month
  const monthlyAssignedNegativeAvailable =
    groupMonthlyAssignedNegativeAvailable(allCategoryMonths);

  // calculate rta available per month
  const updatedMonths = calculateRtaAvailablePerMonth(
    allRtaMonths,
    monthlyAssignedNegativeAvailable,
  );

  // update rta months
  await categoryRepository.updateMonths(prisma, updatedMonths);
};
