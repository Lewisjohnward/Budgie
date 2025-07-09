import { CategoryPayload } from "../category.schema";
import { prisma } from "../../../../shared/prisma/client";
import {
  ensureUserNotAddingToProtectedCategoryGroups,
  ensureUserOwnsCategoryGroup,
} from "../domain/categoryGroup.domain";
import {
  createMonthsForCategory,
  assertCategoryNameIsUniqueInGroup,
} from "../domain/category.domain";
import { categoryRepository } from "../../../../shared/repository/categoryRepositoryImpl";

export const createCategory = async (category: CategoryPayload) => {
  await prisma.$transaction(async (tx) => {
    const { userId, categoryGroupId, name } = category;

    await ensureUserOwnsCategoryGroup(tx, userId, categoryGroupId);

    await ensureUserNotAddingToProtectedCategoryGroups(
      tx,
      userId,
      categoryGroupId,
    );

    await assertCategoryNameIsUniqueInGroup(tx, userId, categoryGroupId, name);

    const newCategory = await categoryRepository.createCategory(tx, category);

    await createMonthsForCategory(tx, userId, newCategory.id);
  });
};
