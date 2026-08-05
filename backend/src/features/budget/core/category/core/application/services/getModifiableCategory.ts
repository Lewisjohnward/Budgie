import { Prisma } from "@prisma/client";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { type CategoryId, type DomainUserCategory } from "../../category.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import {
  CategoryNotFoundError,
  ModifyingAProtectedCategoryError,
} from "../../category.errors";
import { categoryMapper } from "../../category.mapper";
import { SYSTEM_CATEGORY_NAMES } from "../../category.constants";

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
 * @returns A domain representation of the user category if it is modifiable.
 */
export const getModifiableCategory = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<DomainUserCategory> => {
  const row = await categoryRepository.getCategory(tx, userId, categoryId);

  if (!row) {
    throw new CategoryNotFoundError();
  }

  // TODO:(lewis 2026-05-28 13:11) replace name-based system category detection
  // once Category has origin/systemCategoryType fields
  if (Object.values(SYSTEM_CATEGORY_NAMES).some((name) => name === row.name)) {
    throw new ModifyingAProtectedCategoryError();
  }

  return categoryMapper.toDomainUserCategory(row);
};
