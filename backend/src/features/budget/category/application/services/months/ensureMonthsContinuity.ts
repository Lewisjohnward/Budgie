/**
 * Ensures continuity of monthly records for all user categories from their last
 * recorded month up to the current month. This is typically called during login
 * to ensure users have up-to-date monthly data.
 *
 * - Finds the most recent month for each category
 * - Calculates missing months between the most recent and current month
 * - Creates missing month entries with zero values
 *
 * @param prisma - Prisma client or transaction client for database operations
 * @param userId - The user identifier for whom months are managed
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { ZERO } from "../../../../../../shared/constants/zero";
import { getMonthRange } from "../../../utils/getMonthRange";
import { roundToStartOfMonth } from "../../../../../../shared/utils/roundToStartOfMonth";

export const ensureMonthsContinuity = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
) => {
  const currentMonth = roundToStartOfMonth(new Date());

  const mostRecentMonths = await categoryRepository.getMostRecentMonths(
    prisma,
    userId,
  );

  const monthsUpToDate = mostRecentMonths[0].month >= currentMonth;

  if (monthsUpToDate) {
    return;
  }

  const categories = await categoryRepository.getAllCategoryIds(prisma, userId);

  const rtaCategoryId = await categoryRepository.getRtaCategoryId(
    prisma,
    userId,
  );
  const categoryMonthsMap = new Map(
    mostRecentMonths.map((month) => [month.categoryId, month]),
  );

  const missingMonths = getMonthRange(
    mostRecentMonths[0].month,
    currentMonth,
    { startInclusive: false, endInclusive: true },
  );

  if (missingMonths.length === 0) {
    return;
  }

  const mostRecentRtaMonth = mostRecentMonths.find(
    (m) => m.categoryId === rtaCategoryId,
  );

  const monthEntries: Prisma.MonthCreateManyInput[] = [];

  for (const category of categories) {
    for (const month of missingMonths) {
      if (category.id === rtaCategoryId) {
        monthEntries.push({
          categoryId: category.id,
          month,
          activity: ZERO,
          assigned: ZERO,
          available: mostRecentRtaMonth?.available,
        });
      } else {
        const mostRecentAvailableForCategory =
          categoryMonthsMap.get(category.id)?.available || ZERO;
        const available = mostRecentAvailableForCategory.gt(ZERO)
          ? mostRecentAvailableForCategory
          : ZERO;

        monthEntries.push({
          categoryId: category.id,
          month,
          activity: ZERO,
          assigned: ZERO,
          available,
        });
      }
    }
  }

  await categoryRepository.createMonths(prisma, monthEntries);
};
