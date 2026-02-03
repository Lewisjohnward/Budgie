import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { type EditCategoryPayload } from "../../category.schema";
import { prisma } from "../../../../../shared/prisma/client";
import { CategoryNotFoundError } from "../../category.errors";
import { categoryGroupService } from "../../../categorygroup/categoryGroup.service";
import { categoryService } from "../../category.service";
import { asCategoryId, type CategoryId } from "../../category.types";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../categorygroup/categoryGroup.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

//  TODO: IMPLEMENT CHANGE POSITION
// TODO: IF NOTHING CHANGES DON'T INTERACT WITH DB
// TODO: PREVENT USER FROM editing PROTECTED CATEGORy gropus
export type EditCategoryCommand = Omit<
  EditCategoryPayload,
  "userId" | "categoryId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryId: CategoryId;
  categoryGroupId?: CategoryGroupId;
};

const toEditCategoryCommand = (
  p: EditCategoryPayload
): EditCategoryCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryId: asCategoryId(p.categoryId),
  categoryGroupId: p.categoryGroupId
    ? asCategoryGroupId(p.categoryGroupId)
    : undefined,
});

/**
 * Updates an existing category’s name and/or group assignment.
 *
 * This function performs all required validation and authorization checks
 * before persisting changes:
 *
 * - Ensures the category exists and belongs to the given user.
 * - Prevents modification of protected categories.
 * - If a new category group is provided:
 *   - Verifies the user owns the target group.
 *   - Prevents moving the category into a protected group.
 * - If a new name is provided:
 *   - Ensures the name is unique within the target group.
 *
 * If neither `name` nor `categoryGroupId` is provided, the function
 * exits early without performing any database interaction.
 *
 * All operations are executed within a single database transaction to
 * guarantee consistency.
 *
 * @param payload - Raw edit payload containing user identifier, category identifier,
 * and optional updated fields (name and/or categoryGroupId).
 *
 * @throws {CategoryNotFoundError} If the category does not exist or does not belong to the user.
 * @throws {Error} If the category or target group is protected, if the user does not own
 * the specified group, or if the new name is not unique within the group.
 *
 * @returns A promise that resolves when the category has been successfully updated.
 */

export const editCategory = async (
  payload: EditCategoryPayload
): Promise<void> => {
  const { categoryId, userId, categoryGroupId, name } =
    toEditCategoryCommand(payload);

  if (!name && !categoryGroupId) return;

  await prisma.$transaction(async (tx) => {
    const categoryToUpdate = await categoryService.categories.getCategory(
      tx,
      userId,
      categoryId
    );

    if (!categoryToUpdate) {
      throw new CategoryNotFoundError();
    }

    await categoryService.categories.isCategoryProtected(
      tx,
      userId,
      categoryToUpdate.id
    );

    if (categoryGroupId) {
      await categoryGroupService.ensureUserOwnsCategoryGroup(
        tx,
        userId,
        categoryGroupId
      );
      await categoryGroupService.isProtectedCategoryGroup(
        tx,
        userId,
        categoryGroupId
      );
    }

    if (name) {
      await categoryService.categories.checkCategoryNameIsUniqueInGroup(
        tx,
        userId,
        categoryGroupId ?? categoryToUpdate.categoryGroupId,
        name
      );
    }

    await categoryRepository.updateCategory(
      tx,
      categoryId,
      name,
      categoryGroupId
    );
  });
};
