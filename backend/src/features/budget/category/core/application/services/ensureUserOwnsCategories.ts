import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { CategoryNotFoundError } from "../../category.errors";
import { Prisma } from "@prisma/client";
import { CategoryId } from "../../category.types";
import { UserId } from "../../../../../user/auth/auth.types";

/**
 * Ensures that all provided category IDs belong to the given user.
 *
 * Queries the database for the category IDs that match the provided user ID.
 * If any of the category IDs are invalid or do not belong to the user, this
 * function throws a `CategoryNotFoundError`.
 *
 * @param {Prisma.TransactionClient} tx - The Prisma transaction client to use for database queries.
 * @param {UserId} userId - The ID of the user to check ownership against.
 * @param {CategoryId[]} categoryIds - An array of category IDs to verify ownership.
 *
 * @throws {CategoryNotFoundError} Thrown if any category ID is invalid or does not belong to the user.
 *
 * @example
 * await ensureUserOwnsCategories(tx, "user-123", ["cat-1", "cat-2"]);
 * // Throws CategoryNotFoundError if "cat-2" does not belong to "user-123"
 */
export async function ensureUserOwnsCategories(
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryIds: CategoryId[]
): Promise<void> {
  const ids = await categoryRepository.getUserCategoryIds(
    tx,
    userId,
    categoryIds
  );

  if (ids.length !== categoryIds.length) {
    // some categoryIds are either invalid or don't belong to the user
    throw new CategoryNotFoundError();
  }
}
