import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import {
  DeletingProtectedCategoryError,
  UnableToFindProtectedCategoriesInDBError,
} from "../../category.errors";
import { type CategoryId } from "../../category.types";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Verifies that a category is not protected before allowing a destructive operation.
 *
 * Protected categories are system-reserved and must not be deleted or
 * otherwise modified in ways that would violate domain rules. This function
 * acts as a domain safeguard to prevent such operations.
 *
 * Behaviour:
 * - Retrieves all protected category IDs for the given user.
 * - Ensures protected categories are properly configured in the database.
 * - Throws if the provided `categoryId` belongs to the protected set.
 *
 * Domain invariants:
 * - System-protected categories cannot be deleted.
 * - A valid system configuration must always define at least one protected category.
 *
 * @param prisma - Prisma transaction client used to ensure the check runs
 *                 within the surrounding atomic database transaction.
 * @param userId - The ID of the user attempting the operation.
 * @param categoryId - The category being validated for deletion.
 *
 * @returns A promise that resolves if the category is not protected.
 *
 * @throws {UnableToFindProtectedCategoriesInDBError}
 *         If no protected categories are found for the user, indicating
 *         invalid system configuration.
 *
 * @throws {DeletingProtectedCategoryError}
 *         If the provided category is protected and cannot be deleted.
 */
export const isCategoryProtected = async (
  prisma: Prisma.TransactionClient,
  userId: UserId,
  categoryId: CategoryId
): Promise<void> => {
  const protectedCategoryIds = await categoryRepository.getProtectedCategoryIds(
    prisma,
    userId
  );

  console.log("pcids", protectedCategoryIds);

  if (protectedCategoryIds.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedIds = new Set(protectedCategoryIds);

  if (protectedIds.has(categoryId)) {
    throw new DeletingProtectedCategoryError();
  }
};
