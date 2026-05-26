import { CategoryGroupSource, Prisma } from "@prisma/client";
import {
  ModifyingCategoryToProtectedCategoryGroupError,
  NoCategoryGroupFoundError,
} from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import {
  DomainUserCategoryGroup,
  type CategoryGroupId,
} from "../../categoryGroup.types";
import { type UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";

// TODO:(lewis 2026-05-21 19:04) change to assert

export const isProtectedCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<void> => {
  const isProtected = await categoryGroupRepository.isProtectedCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  if (isProtected) {
    throw new ModifyingCategoryToProtectedCategoryGroupError();
  }
};

/**
 * Retrieves a category group that the user is allowed to modify.
 *
 * This function enforces both existence and authorisation rules in a single operation:
 * - Ensures the category group exists for the given user
 * - Ensures the category group is not a SYSTEM (protected) group
 * - Maps the database row into a domain CategoryGroup entity
 *
 * @throws NoCategoryGroupFoundError if the category group does not exist or does not belong to the user
 * @throws ModifyingCategoryToProtectedCategoryGroupError if the category group is SYSTEM-protected and cannot be modified
 *
 * @returns A domain CategoryGroup that is safe to update or delete
 */
export const getModifiableCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<DomainUserCategoryGroup> => {
  const row = await categoryGroupRepository.getCategoryGroupById(
    tx,
    userId,
    categoryGroupId
  );

  if (!row) {
    throw new NoCategoryGroupFoundError();
  }

  if (row.source === CategoryGroupSource.SYSTEM) {
    throw new ModifyingCategoryToProtectedCategoryGroupError();
  }

  return categoryGroupMapper.toDomainUserCategoryGroup(row);
};
