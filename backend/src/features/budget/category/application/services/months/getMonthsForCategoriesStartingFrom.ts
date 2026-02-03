import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type CategoryId, type DomainMonth } from "../../../category.types";

/**
 * Retrieves month records for the given categories starting from a specific date.
 *
 * Responsibilities:
 * - Fetches raw months from the repository for the specified category IDs and start date.
 * - Maps each result from the DB shape to the domain shape.
 *
 * @param tx - Prisma transaction client used to execute the query.
 * @param categoryIds - The category IDs to fetch months for.
 * @param month - The earliest month date to include (inclusive).
 *
 * @returns An array of domain month entities.
 */
export const getMonthsForCategoriesStartingFrom = async (
  tx: Prisma.TransactionClient,
  categoryIds: CategoryId[],
  month: Date
): Promise<DomainMonth[]> => {
  const months = await categoryRepository.getMonthsForCategoriesStartingFrom(
    tx,
    categoryIds,
    month
  );

  return months.map(categoryMapper.toDomainMonth);
};
