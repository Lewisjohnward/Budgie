import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { CategoryId, DomainMonth } from "../../../category.types";
import { categoryMapper } from "../../../category.mapper";

/**
 * Fetches and maps months for the given category IDs.
 *
 * Retrieves raw month records from the repository and converts them
 * into domain Month objects.
 *
 * @param tx - Prisma transaction client
 * @param categoryIds - Category IDs to fetch months for
 * @returns Array of domain Month objects
 */
export const getMonthsForCategories = async (
  tx: Prisma.TransactionClient,
  categoryIds: CategoryId[]
): Promise<DomainMonth[]> => {
  const months = await categoryRepository.getMonthsForCategories(
    tx,
    categoryIds
  );

  return months.map(categoryMapper.toDomainMonth);
};
