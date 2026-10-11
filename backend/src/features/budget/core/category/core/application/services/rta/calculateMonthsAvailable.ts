import { type Prisma, type PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { groupMonthlyAssignedNegativeAvailable } from "../../../../../../../../shared/utils/groupMonthlyAssignedNegativeAvailable";
import { calculateRtaAvailablePerMonth } from "../../../domain/rta.domain";
import { categoryService } from "../../../category.service";
import { type CategoryId, type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../../../user/auth/auth.types";

/**
 * Recalculates RTA availability and updates only months whose available
 * amounts have changed.
 *
 * @param prisma - Prisma client or transaction client for database operations.
 * @param userId - The ID of the user whose RTA months are being recalculated.
 * @param rtaCategoryId - The category ID representing RTA months.
 * @returns The RTA months whose available amounts have changed.
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
  const calculatedMonths = calculateRtaAvailablePerMonth(
    allRtaMonths,
    monthlyAssignedNegativeAvailable
  );

  const existingMonthsById = new Map(
    allRtaMonths.map((month) => [month.id, month])
  );

  const changedMonths = calculatedMonths.filter((month) => {
    const existingMonth = existingMonthsById.get(month.id);

    return (
      existingMonth === undefined ||
      !month.available.equals(existingMonth.available)
    );
  });

  if (changedMonths.length > 0) {
    await categoryRepository.updateMonths(prisma, changedMonths);
  }

  return changedMonths;
};
