import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type CategoryId, type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../../user/auth/auth.types";

/**
 * Retrieves all month records for non-RTA categories belonging to a user.
 *
 * Responsibilities:
 * - Fetches raw months from the repository (excluding the RTA category).
 * - Maps each result from the DB shape to the domain shape.
 *
 * @param tx - Prisma transaction client used to execute the query.
 * @param userId - ID of the user whose category months are retrieved.
 * @param rtaCategoryId - The RTA category ID to exclude from results.
 *
 * @returns An array of domain month entities.
 */

export const getAllMonthsForCategories = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  rtaCategoryId: CategoryId
): Promise<DomainMonth[]> => {
  const months = await categoryRepository.getAllMonthsForCategories(
    tx,
    userId,
    rtaCategoryId
  );

  return months.map(categoryMapper.toDomainMonth);
};
