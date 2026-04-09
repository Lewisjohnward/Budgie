import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { type CreateCategoryPayload } from "../../category.schema";
import { categoryService } from "../../category.service";

export type CreateCategoryCommand = Omit<
  CreateCategoryPayload,
  "userId" | "categoryGroupId"
> & {
  userId: UserId;
  categoryGroupId: CategoryGroupId;
};

export const toCreateCategoryCommand = (
  p: CreateCategoryPayload
): CreateCategoryCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryGroupId: asCategoryGroupId(p.categoryGroupId),
});

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const { userId, categoryGroupId, name } = toCreateCategoryCommand(payload);

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

    await categoryService.categories.checkCategoryNameIsUniqueInGroup(
      tx,
      userId,
      categoryGroupId,
      name
    );

    const nextPosition =
      await categoryService.categories.getNextCategoryPosition(
        tx,
        categoryGroupId
      );

    const newCategory = await categoryService.categories.createCategory(tx, {
      ...payload,
      position: nextPosition,
    });

    await categoryService.months.createMonthsForCategory(
      tx,
      userId,
      newCategory.id
    );
  });
};
