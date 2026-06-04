import { prisma } from "../../../../../../../shared/prisma/client";
import { asUserId, UserId } from "../../../../../../user/auth/auth.types";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import {
  asCategoryGroupId,
  type CategoryGroupId,
} from "../../../../categorygroup/categoryGroup.types";
import { CreateCategoryResult } from "../../category.contract";
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
): Promise<CreateCategoryResult> => {
  return await prisma.$transaction(async (tx) => {
    const { userId, categoryGroupId, name } = toCreateCategoryCommand(payload);

    await categoryGroupService.getModifiableCategoryGroup(
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

    const createdCategory = await categoryService.categories.createCategory(
      tx,
      {
        ...payload,
        position: nextPosition,
      }
    );

    const createdMonths = await categoryService.months.createMonthsForCategory(
      tx,
      userId,
      createdCategory.id
    );

    return {
      createdCategory,
      createdMonths,
    };
  });
};
