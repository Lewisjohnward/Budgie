import { Prisma } from "@prisma/client";
import { DuplicateCategoryNameError } from "../../category.errors";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Ensures that a category name is unique within a specific category group
 * for a given user.
 *
 * This function checks whether another category with the same `name`
 * already exists inside the provided `categoryGroupId` and belongs to
 * the specified user. If a duplicate is found, a
 * `DuplicateCategoryNameError` is thrown.
 *
 * The validation is executed using the provided Prisma transaction client,
 * allowing it to participate in a larger transactional workflow.
 *
 * @param tx - Prisma transaction client used to execute the query
 * @param userId - Identifier of the user who owns the category group
 * @param categoryGroupId - Identifier of the category group in which
 * uniqueness must be enforced
 * @param name - Proposed category name to validate
 *
 * @throws {DuplicateCategoryNameError} If a category with the same name
 * already exists in the specified group for the user
 *
 * @returns A promise that resolves if the name is unique
 */
export const checkCategoryNameIsUniqueInGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId,
  name: string
): Promise<void> => {
  if (
    await categoryRepository.existsCategoryWithNameInGroup(
      tx,
      userId,
      categoryGroupId,
      name
    )
  ) {
    throw new DuplicateCategoryNameError();
  }
};
