import { type UpdateCategoryPayload } from "../../category.schema";
import { prisma } from "../../../../../../../shared/prisma/client";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import { categoryService } from "../../category.service";
import {
  asCategoryId,
  type DomainCategory,
  type CategoryId,
} from "../../category.types";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import { categoryMapper } from "../../category.mapper";

//  TODO: IMPLEMENT CHANGE POSITION
// TODO: IF NOTHING CHANGES DON'T INTERACT WITH DB
// TODO: PREVENT USER FROM editing PROTECTED CATEGORy gropus
export type UpdateCategoryCommand = Omit<
  UpdateCategoryPayload,
  "userId" | "categoryId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryId: CategoryId;
  categoryGroupId?: CategoryGroupId;
  position?: number;
};

const toUpdateCategoryCommand = (
  p: UpdateCategoryPayload
): UpdateCategoryCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryId: asCategoryId(p.categoryId),
  categoryGroupId: p.categoryGroupId
    ? asCategoryGroupId(p.categoryGroupId)
    : undefined,
  position: p.position,
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

export const updateCategory = async (
  payload: UpdateCategoryPayload
): Promise<DomainCategory> => {
  const { categoryId, userId, categoryGroupId, name, position } =
    toUpdateCategoryCommand(payload);

  return await prisma.$transaction(async (tx) => {
    let category = await categoryService.categories.getModifiableCategory(
      tx,
      userId,
      categoryId
    );

    if (categoryGroupId) {
      await categoryGroupService.getModifiableCategoryGroup(
        tx,
        userId,
        categoryGroupId
      );
    }

    if (name !== undefined) {
      category = await categoryService.categories.renameCategory(
        tx,
        category.id,
        name
      );
    }

    if (position !== undefined) {
      const fromCategory = category;
      const fromGroupId = fromCategory.categoryGroupId;
      const toGroupId = categoryGroupId ?? fromGroupId;

      category = await categoryService.categories.moveCategory({
        tx,
        userId,
        categoryId: category.id,
        originalGroupId: fromCategory.categoryGroupId,
        newGroupId: toGroupId,
        fromPosition: fromCategory.position,
        toPosition: position,
      });
    }
    return category;
  });
};
