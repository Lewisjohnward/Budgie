import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { categoryGroupService } from "../../../categorygroup/categoryGroup.service";
import { CreateCategoryPayload } from "../../category.schema";
import { categoryService } from "../../category.service";

export const createCategory = async (category: CreateCategoryPayload) => {
  await prisma.$transaction(async (tx) => {
    const { userId, categoryGroupId, name } = category;

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

    await categoryService.categories.checkCategoryNameIsUniqueInGroup(
      tx,
      userId,
      categoryGroupId,
      name,
    );

    const nextPosition =
      await categoryService.categories.getNextCategoryPosition(
        tx,
        categoryGroupId,
      );

    const newCategory = await categoryRepository.createCategory(tx, {
      ...category,
      position: nextPosition,
    });

    await categoryService.months.createMonthsForCategory(
      tx,
      userId,
      newCategory.id,
    );
  });
};
