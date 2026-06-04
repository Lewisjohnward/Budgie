import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../../shared/repository/categoryRepositoryImpl";
import { type DomainMonth, type CategoryId } from "../../../category.types";
import { type UserId } from "../../../../../../../user/auth/auth.types";
import { categoryMapper } from "../../../category.mapper";
import { v4 as uuidv4 } from "uuid";
import { MonthCreationMismatchError } from "../../../category.errors";

/**
 * Creates all required month records for a category based on the user's existing budget timeline.
 *
 * This function ensures that a newly created category is aligned with the user's full set of
 * budget months by generating missing month entries and persisting them in a single transaction.
 *
 * It guarantees consistency by validating that the number of persisted months matches the
 * expected number derived from the user's existing month timeline. If this invariant is violated,
 * a `MonthCreationMismatchError` is thrown.
 *
 * @param tx - Prisma transaction client used to ensure atomic writes
 * @param userId - The user owning the budget timeline used as the month source
 * @param categoryId - The category for which month records are being created
 * @returns The full list of created month domain objects for the category
 * @throws MonthCreationMismatchError - If the number of created months does not match the expected count
 */
export const createMonthsForCategory = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<DomainMonth[]> => {
  // Get all of the current months for the user (smell)
  const existingMonths = await categoryRepository.getExistingMonths(tx, userId);

  // Create set of unique months
  const uniqueMonths = [
    ...new Set(existingMonths.map((month) => month.toISOString())),
  ];

  // Build an array of new months to insert into db
  const newMonths: Prisma.MonthCreateManyInput[] = uniqueMonths.map(
    (monthStr) => ({
      categoryId,
      id: uuidv4(),
      month: new Date(monthStr),
    })
  );

  // Insert the new months into the db
  await categoryRepository.createMonths(tx, newMonths);

  // Get the newly created months
  const createdMonths = await categoryRepository.getMonthsForCategories(tx, [
    categoryId,
  ]);

  // If new months length and created months length are unequal throw error
  if (newMonths.length !== createdMonths.length) {
    throw new MonthCreationMismatchError(
      newMonths.length,
      createdMonths.length
    );
  }

  return createdMonths.map(categoryMapper.toDomainMonth);
};
