import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { type CategoryId } from "../../../category.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Creates month records for a newly created category based on all
 * months that already exist for the user.
 *
 * This function:
 * - Retrieves all existing months associated with the user’s categories.
 * - Deduplicates them to ensure each month is only created once.
 * - Generates corresponding `Month` records for the provided `categoryId`.
 * - Persists them in bulk using the repository.
 *
 * The operation runs within the provided Prisma transaction to ensure
 * consistency with surrounding changes (e.g., category creation).
 *
 * This is typically used to synchronize a new category with the user’s
 * historical month structure.
 *
 * @param prisma - Prisma transaction client used to execute the operation
 * within an active transaction
 * @param userId - Identifier of the user whose existing months are used
 * as the template
 * @param categoryId - Identifier of the category for which month records
 * should be created
 *
 * @returns A promise that resolves once all corresponding month records
 * have been created
 */
export const createMonthsForCategory = async (
  prisma: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<void> => {
  const existingMonths = await categoryRepository.getExistingMonths(
    prisma,
    userId
  );

  const uniqueMonths = [
    ...new Set(existingMonths.map((month) => month.toISOString())),
  ];

  const newMonths: Prisma.MonthCreateManyInput[] = uniqueMonths.map(
    (monthStr) => ({
      categoryId,
      month: new Date(monthStr),
    })
  );

  await categoryRepository.createMonths(prisma, newMonths);
};
