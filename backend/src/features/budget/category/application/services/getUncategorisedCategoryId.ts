import { Prisma } from "@prisma/client";
import { asCategoryId, type CategoryId } from "../../category.types";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { UncategorisedCategoryIdNotFound } from "../../category.errors";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Retrieves the **Uncategorised** category ID for a given user.
 *
 * The Uncategorised category is a system-defined fallback category used when
 * a transaction is created without an explicitly assigned category. Every
 * user is expected to have exactly one such category.
 *
 * This function:
 * - Queries the repository for the user’s Uncategorised category ID.
 * - Ensures the category exists.
 * - Converts the raw database identifier into a branded `CategoryId`.
 *
 * Domain invariants:
 * - Each user must have a single Uncategorised category.
 * - Transactions without a provided category must resolve to this category.
 * - The returned value is guaranteed to be a valid `CategoryId`.
 *
 * @param tx - Prisma transaction client used to participate in an existing
 *             atomic database transaction.
 * @param userId - The ID of the user whose Uncategorised category is being retrieved.
 *
 * @returns A promise resolving to the user's Uncategorised `CategoryId`.
 *
 * @throws {UncategorisedCategoryIdNotFound} If the user does not have an
 *         Uncategorised category defined.
 */
export const getUncategorisedCategoryId = async (
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<CategoryId> => {
  const id = await categoryRepository.getUncategorisedCategoryId(tx, userId);

  if (!id) throw new UncategorisedCategoryIdNotFound();

  return asCategoryId(id);
};
