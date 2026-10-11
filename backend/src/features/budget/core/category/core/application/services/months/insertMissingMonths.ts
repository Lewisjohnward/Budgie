import { Prisma, PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { ZERO } from "../../../../../../../../shared/constants/zero";
import { getMonthRange } from "../../../utils/getMonthRange";
import { type UserId } from "../../../../../../../user/auth/auth.types";
import { asCategoryId, asMonthId, DomainMonth } from "../../../category.types";

const MAX_MONTHS = 12;

/**
 * Inserts missing budget month records for all of a user's categories and
 * returns the newly created months.
 *
 * Determines the missing months between the transaction date and the earliest
 * existing budget month, then creates records for each category for up to the
 * most recent {@link MAX_MONTHS} missing months. New records are initialised
 * with zero activity, availability, and assigned amounts.
 *
 * If no month records need to be created, returns an empty array.
 *
 * @param prisma - Prisma client or transaction client used for database operations.
 * @param userId - ID of the user whose budget months are being created.
 * @param transactionDate - Date of the transaction triggering the backfill.
 * @returns The newly created domain month records, or an empty array if none were created.
 */
export const insertMissingMonths = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: UserId,
  transactionDate: Date
): Promise<DomainMonth[]> => {
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
  const monthEntries: DomainMonth[] = [];

  for (const id of categoryIds) {
    for (const month of recentMonths) {
      monthEntries.push({
        id: asMonthId(uuidv4()),
        categoryId: asCategoryId(id),
        month,
        activity: ZERO,
        available: ZERO,
        assigned: ZERO,
      });
    }
  }

  if (monthEntries.length === 0) return [];

  await categoryRepository.createMonths(prisma, monthEntries);

  return monthEntries;
};
