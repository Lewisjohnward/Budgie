import { CategoryNotFoundError } from "../../category.errors";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { Prisma } from "@prisma/client";
import { type CategoryId, type DomainCategory } from "../../category.types";
import { categoryMapper } from "../../category.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Loads a category for a specific user and maps it to a domain entity.
 *
 * This function guarantees user-level isolation by querying the category
 * within the scope of the provided `userId`. The underlying repository
 * returns a persistence model, which is then converted into a
 * `DomainCategory` via the mapper.
 *
 * If no matching category is found, a `CategoryNotFoundError` is thrown.
 *
 * @param tx - Prisma transaction client used to execute the query within an active transaction
 * @param userId - Identifier of the user who owns the category
 * @param categoryId - Identifier of the category to retrieve
 *
 * @returns A fully mapped `DomainCategory` instance
 *
 * @throws {CategoryNotFoundError} Thrown when the category does not exist
 * or does not belong to the specified user
 */

export const getCategory = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<DomainCategory> => {
  const rawCategory = await categoryRepository.getCategory(
    tx,
    userId,
    categoryId
  );

  if (!rawCategory) {
    throw new CategoryNotFoundError();
  }

  return categoryMapper.toDomainCategory(rawCategory);
};
