import { CategoryNotFoundError } from "../../category.errors";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { Prisma } from "@prisma/client";
import { Category } from "../../category.types";

/**
 * Retrieves a category owned by the given user.
 *
 * This function enforces isolation by scoping the lookup to `userId`.
 * If no category with the given `categoryId` exists for that user, a
 * `CategoryNotFoundError` is thrown.
 *
 * @param tx - Prisma transaction client used to execute the query
 * @param userId - ID of the user who owns the category
 * @param categoryId - ID of the category to retrieve
 *
 * @throws {CategoryNotFoundError} If the category does not exist or does not belong to the user
 *
 * @returns The requested category entity
 */

export const getCategory = async (
  tx: Prisma.TransactionClient,
  userId: string,
  categoryId: string
): Promise<Category> => {
  const category = await categoryRepository.getCategory(tx, userId, categoryId);

  if (!category) {
    throw new CategoryNotFoundError();
  }

  return category;
};
