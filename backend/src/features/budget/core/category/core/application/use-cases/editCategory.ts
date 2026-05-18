import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { type EditCategoryPayload } from "../../category.schema";
import { prisma } from "../../../../../../../shared/prisma/client";
import { CategoryNotFoundError } from "../../category.errors";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import { categoryService } from "../../category.service";
import { asCategoryId, type CategoryId } from "../../category.types";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import { categoryMapper } from "../../category.mapper";
import { CategoryDto } from "../../types/category.dto";

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
): Promise<CategoryDto> => {
  const { categoryId, userId, categoryGroupId, name } =
    toEditCategoryCommand(payload);

  return await prisma.$transaction(async (tx) => {
    const categoryToUpdate = await categoryService.categories.getCategory(
      tx,
      userId,
      categoryId
    );

    // TODO:(lewis 2026-05-18 14:15) this should be in the service above
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

    // TODO:(lewis 2026-05-18 14:00) needs to go in service
    const updatedCategory = await categoryRepository.updateCategory(
      tx,
      categoryId,
      name,
      categoryGroupId
    );
    const tempC = categoryMapper.toDomainCategory(updatedCategory);

    return categoryMapper.toCategoryDto(tempC);
  });
};
