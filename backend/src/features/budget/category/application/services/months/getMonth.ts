import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type MonthId, type DomainMonth } from "../../../category.types";
import { MonthNotFoundError } from "../../../category.errors";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Retrieves a single month record owned by the given user.
 *
 * Responsibilities:
 * - Fetches the raw month from the repository.
 * - Maps the result from the DB shape to the domain shape.
 * - Throws if the month does not exist or does not belong to the user.
 *
 * @param tx - Prisma transaction client used to execute the query.
 * @param userId - ID of the user who owns the month's category.
 * @param monthId - ID of the month to retrieve.
 *
 * @throws {MonthNotFoundError} If the month does not exist or does not belong to the user.
 *
 * @returns The requested month as a domain entity.
 */

export const getMonth = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  monthId: MonthId
): Promise<DomainMonth> => {
  const month = await categoryRepository.getMonth(tx, userId, monthId);

  if (!month) {
    throw new MonthNotFoundError();
  }

  return categoryMapper.toDomainMonth(month);
};
