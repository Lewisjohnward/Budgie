import { Prisma, PrismaClient } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { ZERO } from "../../../../../../shared/constants/zero";
import { getMonthRange } from "../../../utils/getMonthRange";
import { type UserId } from "../../../../../user/auth/auth.types";

const MAX_MONTHS = 12;

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
export const insertMissingMonths = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: UserId,
  transactionDate: Date
) => {
  const earliestMonth = await categoryRepository.getEarliestPastMonth(
    prisma,
    userId
  );

  const startDate =
    earliestMonth < transactionDate ? earliestMonth : transactionDate;
  const endDate =
    earliestMonth > transactionDate ? earliestMonth : transactionDate;

  const missingMonths = getMonthRange(startDate, endDate, {
    startInclusive: true,
    endInclusive: false,
  });

  const categoryIds = await categoryRepository.getAllCategoryIds(
    prisma,
    userId
  );

  const recentMonths = missingMonths.slice(-MAX_MONTHS);
  const monthEntries: Prisma.MonthCreateManyInput[] = [];

  for (const id of categoryIds) {
    for (const month of recentMonths) {
      monthEntries.push({
        categoryId: id,
        month,
        activity: ZERO,
        assigned: ZERO,
      });
    }
  }

  if (monthEntries.length > 0) {
    await categoryRepository.createMonths(prisma, monthEntries);
  }
};
