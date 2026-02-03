import { Prisma } from "@prisma/client";
import { NoCategoryGroupFoundError } from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type CategoryGroupId } from "../../categoryGroup.types";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Ensures that a category group exists and belongs to the given user.
 *
 * This function acts as a domain guard to enforce ownership before
 * performing any operation on a category group. It queries the repository
 * within the provided transactional context and throws if the resource
 * is not found or does not belong to the user.
 *
 * @async
 * @function ensureUserOwnsCategoryGroup
 * @param {Prisma.TransactionClient} prisma - Prisma transaction client used to
 * execute the check within an existing database transaction.
 * @param {string} userId - Identifier of the user attempting to access the category group.
 * @param {CategoryGroupId} categoryGroupId - Domain identifier of the category group.
 *
 * @throws {NoCategoryGroupFoundError}
 * Thrown when the category group does not exist or is not owned by the given user.
 *
 * @returns {Promise<void>} Resolves silently if ownership is confirmed.
 *
 * @example
 * await ensureUserOwnsCategoryGroup(tx, userId, categoryGroupId);
 */
export const ensureUserOwnsCategoryGroup = async (
  prisma: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<void> => {
  const exists = await categoryGroupRepository.existsCategoryGroup(
    prisma,
    userId,
    categoryGroupId
  );

  if (!exists) {
    throw new NoCategoryGroupFoundError();
  }
};
