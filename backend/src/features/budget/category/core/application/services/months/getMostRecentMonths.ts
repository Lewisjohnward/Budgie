import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../../user/auth/auth.types";

/**
 * Retrieves the most recent month entry for each category belonging to a user.
 *
 * Responsibilities:
 * - Fetches the most recent raw month per category from the repository.
 * - Maps each result from the DB shape to the domain shape.
 *
 * @param tx - Prisma transaction client used to execute the query.
 * @param userId - ID of the user.
 *
 * @returns An array of domain month entities, one per category.
 */

export const getMostRecentMonths = async (
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<DomainMonth[]> => {
  const months = await categoryRepository.getMostRecentMonths(tx, userId);

  return months.map(categoryMapper.toDomainMonth);
};
