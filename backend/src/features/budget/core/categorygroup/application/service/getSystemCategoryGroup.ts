import { type Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import {
  DomainUserCategoryGroup,
  type CategoryGroupId,
} from "../../categoryGroup.types";
import { NoCategoryGroupFoundError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";

// TODO:(lewis 2026-05-21 18:57) needs jsdoc rewriting
/**
 * Retrieves a single category group for a user within a transaction.
 *
 * ## Behaviour
 * - Queries the repository within the provided Prisma transaction
 * - Ensures the category group belongs to the given user
 * - Throws a domain error if the category group cannot be found
 * - Maps the database entity into a domain model before returning it
 *
 * ## Error Handling
 * - Throws `NoCategoryGroupFoundError` when no matching record exists
 *
 * @param tx - Prisma transaction client used to ensure atomic read consistency
 * @param userId - The ID of the user owning the category group
 * @param categoryGroupId - The ID of the category group to retrieve
 * @returns The domain representation of the requested category group
 */
export const getUserCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<DomainUserCategoryGroup> => {
  const rawCategoryGroup = await categoryGroupRepository.getUserCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  if (!rawCategoryGroup) {
    throw new NoCategoryGroupFoundError();
  }

  return categoryGroupMapper.toDomainUserCategoryGroup(rawCategoryGroup);
};
