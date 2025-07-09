import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { EditCategoryPayload } from "../../category.schema";
import { prisma } from "../../../../../shared/prisma/client";
import { CategoryNotFoundError } from "../../category.errors";
import { categoryGroupService } from "../../../categorygroup/categoryGroup.service";
import { categoryService } from "../../category.service";

export const updateCategory = async (payload: EditCategoryPayload) => {
  const { categoryId, userId, categoryGroupId, name } = payload;

  if (!name && !categoryGroupId) return;

  await prisma.$transaction(async (tx) => {
    const categoryToUpdate = await categoryRepository.getCategory(
      tx,
      userId,
      categoryId,
    );

    if (!categoryToUpdate) {
      throw new CategoryNotFoundError();
    }

    if (categoryGroupId) {
      await categoryGroupService.ensureUserOwnsCategoryGroup(
        tx,
        userId,
        categoryGroupId,
      );
      await categoryGroupService.ensureNotAddingToProtectedCategoryGroup(
        tx,
        userId,
        categoryGroupId,
      );
    }

    if (name) {
      await categoryService.categories.checkCategoryNameIsUniqueInGroup(
        tx,
        userId,
        categoryGroupId ?? categoryToUpdate.categoryGroupId,
        name,
      );
    }

    await categoryRepository.updateCategory(
      tx,
      categoryId,
      name,
      categoryGroupId,
    );
  });
};
