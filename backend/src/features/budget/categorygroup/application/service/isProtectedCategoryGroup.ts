import { Prisma } from "@prisma/client";
import { AddingCategoryToProtectedCategoryGroupError } from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type CategoryGroupId } from "../../categoryGroup.types";
import { UserId } from "../../../../user/auth/auth.types";

export const isProtectedCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<void> => {
  // const protectedCategoryGroupIds =
  //   await categoryGroupRepository.getProtectedCategoryGroupIds(prisma, userId);

  // If this invariant can be broken, keep this check.
  // (But ideally you ensure these exist at user creation time.)
  // const hasAnyProtected =
  //   await categoryGroupRepository.hasAnyProtectedCategoryGroups(tx, userId);
  // if (!hasAnyProtected) throw new UnableToFindProtectedCategoriesInDBError();

  const isProtected = await categoryGroupRepository.isProtectedCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  if (isProtected) {
    throw new AddingCategoryToProtectedCategoryGroupError();
  }

  // if (protectedCategoryGroupIds.length === 0)
  //   throw new UnableToFindProtectedCategoriesInDBError();
  //
  // const protectedGroupIds = new Set(protectedCategoryGroupIds);
  //
  // //TODO: THIS ERROR NEEDS A NAME CHANGE
  // if (protectedGroupIds.has(categoryGroupId)) {
  //   throw new AddingCategoryToProtectedCategoryGroupError();
  // }
};
