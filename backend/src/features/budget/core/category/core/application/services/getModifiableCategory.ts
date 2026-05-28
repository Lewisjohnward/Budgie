import { Prisma } from "@prisma/client";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { type CategoryId, type DomainCategory } from "../../category.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import {
  CategoryNotFoundError,
  ModifyingAProtectedCategoryError,
} from "../../category.errors";
import { PROTECTED_CATEGORY_NAMES } from "../../category.constants";
import { categoryMapper } from "../../category.mapper";

/**
 * Retrieves a category that can be safely modified by a user.
 *
 * This function enforces ownership and basic protection rules by:
 * - Ensuring the category exists for the given user.
 * - Preventing modification of protected/system categories.
 * - Mapping the database row into a domain-level category object.
 *
 * @param tx - Prisma transaction client used for database operations.
 * @param userId - ID of the user requesting the category.
 * @param categoryId - ID of the category to retrieve.
 *
 * @throws {CategoryNotFoundError}
 * Thrown when no category exists for the given user and category ID.
 *
 * @throws {ModifyingAProtectedCategoryError}
 * Thrown when attempting to access a protected category.
 *
 * @returns A domain representation of the category if it is modifiable.
 */
export const getModifiableCategory = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<DomainCategory> => {
  const row = await categoryRepository.getCategory(tx, userId, categoryId);

  if (!row) {
    throw new CategoryNotFoundError();
  }

  // TODO:(lewis 2026-05-28 13:11) need to create origin: system | user in category table
  if ((PROTECTED_CATEGORY_NAMES as readonly string[]).includes(row.name)) {
    throw new ModifyingAProtectedCategoryError();
  }

  return categoryMapper.toDomainCategory(row);
};
