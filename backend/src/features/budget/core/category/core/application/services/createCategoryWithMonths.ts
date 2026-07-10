import { type Prisma } from "@prisma/client";
import { categoryGroupService } from "../../../../categorygroup/categoryGroup.service";
import { type CreateCategoryResult } from "../../category.contract";
import { categoryService } from "../../category.service";
import { type CreateCategoryCommand } from "../use-cases/createCategory";

export const createCategoryWithMonths = async (
  tx: Prisma.TransactionClient,
  command: CreateCategoryCommand
): Promise<CreateCategoryResult> => {
  const { userId, categoryGroupId, name } = command;

  await categoryGroupService.getModifiableCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  const nextPosition = await categoryService.categories.getNextCategoryPosition(
    tx,
    categoryGroupId
  );

  const createdCategory = await categoryService.categories.createCategory(tx, {
    userId,
    name,
    categoryGroupId,
    position: nextPosition,
  });

  const createdMonths = await categoryService.months.createMonthsForCategory(
    tx,
    userId,
    createdCategory.id
  );

  return {
    createdCategory,
    createdMonths,
  };
};
