import { Prisma } from "@prisma/client";
import { type UserId } from "../../../../user/auth/auth.types";
import {
  type DomainMonth,
  type MonthId,
} from "../../../category/category.types";
import { categoryMapper } from "../../../category/category.mapper";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";

/**
 * Fetches months by their IDs for a specific user and maps them to domain objects.
 *
 * @param tx - The Prisma transaction client
 * @param userId - The ID of the user who owns the months
 * @param monthIds - Array of month IDs to fetch
 * @returns A promise resolving to an array of DomainMonth objects
 */
export const getMonthsByIds = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  monthIds: MonthId[]
): Promise<DomainMonth[]> => {
  const rows = await categoryRepository.getMonthsFromIds(tx, userId, monthIds);
  return rows.map(categoryMapper.toDomainMonth);
};
