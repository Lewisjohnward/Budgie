import { type UpdateCategoryPayload } from "../../category.schema";
import { prisma } from "../../../../../../../shared/prisma/client";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import { categoryService } from "../../category.service";
import { asCategoryId, type CategoryId } from "../../category.types";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import { type UpdateCategoryResult } from "../../contracts/updateCategory.contract";

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
 * Updates a category using either a rename or move operation.
 *
 * This use case acts as a command dispatcher that routes the update request
 * into one of two domain operations:
 *
 * 1. Rename operation
 *    - Updates only the category name
 *    - Does not affect ordering or sibling categories
 *
 * 2. Move operation
 *    - Moves a category within the same group or across groups
 *    - Updates the category's position
 *    - May trigger reordering of sibling categories within affected groups
 *
 * Only one operation is allowed per request:
 * - If `name` is provided, the request is treated as a rename operation
 * - If `position` is provided, the request is treated as a move operation
 * - Mixing both or providing neither is invalid and will result in an error
 *
 * All operations are executed inside a single database transaction to ensure
 * consistency across category ordering and group constraints.
 *
 * Domain rules enforced:
 * - Category must exist and belong to the user
 * - Target category group (if provided) must be valid and modifiable
 * - Protected categories and groups cannot be modified
 * - Move operations may affect multiple sibling categories due to reordering rules
 *
 * Side effects:
 * - Rename: updates only the target category
 * - Move: updates the target category and returns all affected categories whose
 *   positions or group assignments changed as a result of reordering
 *
 * @param payload - Raw update payload containing:
 * - `userId`: authenticated user identifier
 * - `categoryId`: category to update
 * - `name?`: new category name (rename operation)
 * - `categoryGroupId?`: target group (move operation)
 * - `position?`: target position (move operation)
 *
 * @throws {Error} If no valid operation is provided (neither rename nor move)
 * @throws {CategoryNotFoundError} If the category does not exist or does not belong to the user
 * @throws {CategoryGroupAccessError} If the target group is not accessible or is protected
 * @throws {CategoryValidationError} If rename violates uniqueness constraints within a group
 *
 * @returns A promise resolving to an `UpdateCategoryResult` containing:
 * - `updatedCategory`: the primary updated category
 * - `affectedCategories`: categories impacted by reordering (move operations only)
 */

export const updateCategory = async (
  payload: UpdateCategoryPayload
): Promise<UpdateCategoryResult> => {
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

    // RENAME
    if (name !== undefined) {
      category = await categoryService.categories.renameCategory(
        tx,
        category.id,
        name
      );

      return {
        updatedCategory: category,
        affectedCategories: [],
      };
    }

    // MOVE
    if (position !== undefined) {
      const toGroupId = categoryGroupId ?? category.categoryGroupId;

      const result = await categoryService.categories.moveCategory({
        tx,
        userId,
        categoryId: category.id,
        originalGroupId: category.categoryGroupId,
        newGroupId: toGroupId,
        fromPosition: category.position,
        toPosition: position,
      });

      return result;
    }

    throw new Error("No update operation specified");
  });
};
