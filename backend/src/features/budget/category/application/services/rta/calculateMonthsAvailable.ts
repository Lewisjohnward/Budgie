import { type Prisma, type PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { groupMonthlyAssignedNegativeAvailable } from "../../../../../../shared/utils/groupMonthlyAssignedNegativeAvailable";
import { calculateRtaAvailablePerMonth } from "../../../domain/rta.domain";
import { categoryService } from "../../../category.service";
import { type CategoryId, type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Recalculates and updates the available amounts for Ready-To-Assign (RTA) months for a user,
 * and returns the updated RTA month records.
 *
 * Steps:
 * 1. Fetch all category months and RTA months for the user and specified RTA category.
 * 2. Aggregate negative assigned amounts from category months per month.
 * 3. Calculate updated available amounts for each RTA month.
 * 4. Persist the updated RTA months to the database.
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param userId - The ID of the user whose RTA months are being recalculated.
 * @param rtaCategoryId - The category ID representing RTA months.
 * @returns Promise resolving to an array of updated DomainMonth objects representing the recalculated RTA months.
 */
export const calculateMonthsAvailable = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: UserId,
  rtaCategoryId: CategoryId
): Promise<DomainMonth[]> => {
  const allCategoryMonths =
    await categoryService.months.getAllMonthsForCategories(
      prisma,
      userId,
      rtaCategoryId
    );
  // get all (updated) rta months
  const allRtaMonths = await categoryService.months.getAllRtaMonths(
    prisma,
    userId,
    rtaCategoryId
  );
  // group category groups by total negative per month
  const monthlyAssignedNegativeAvailable =
    groupMonthlyAssignedNegativeAvailable(allCategoryMonths);

  // calculate rta available per month
  const updatedMonths = calculateRtaAvailablePerMonth(
    allRtaMonths,
    monthlyAssignedNegativeAvailable
  );

  // update rta months
  await categoryRepository.updateMonths(prisma, updatedMonths);

  return updatedMonths;
};
