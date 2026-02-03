import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../category.mapper";
import { type CategoryId, type DomainMonth } from "../../../category.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Retrieves all month records for the RTA (Ready to Assign) category.
 *
 * Responsibilities:
 * - Fetches raw RTA months from the repository.
 * - Maps each result from the DB shape to the domain shape.
 *
 * @param tx - Prisma transaction client used to execute the query.
 * @param userId - ID of the user whose RTA months are retrieved.
 * @param rtaCategoryId - The RTA category ID.
 *
 * @returns An array of domain month entities for the RTA category.
 */

export const getAllRtaMonths = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  rtaCategoryId: CategoryId
): Promise<DomainMonth[]> => {
  const months = await categoryRepository.getAllRtaMonths(
    tx,
    userId,
    rtaCategoryId
  );

  return months.map(categoryMapper.toDomainMonth);
};
