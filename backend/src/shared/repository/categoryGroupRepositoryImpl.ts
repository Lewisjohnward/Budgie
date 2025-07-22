import { CategoryGroup, Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_GROUP_NAMES } from "../../features/budget/categorygroup/categoryGroup.constants";
import { CategoryGroupRepository } from "../../features/budget/categorygroup/categoryGroup.repository";
import {
  CreateCategoryGroupData,
  EditCategoryGroupData,
} from "../../features/budget/categorygroup/categorygroup.schema";

export const categoryGroupRepository: CategoryGroupRepository = {
  getCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    userId: string,
    categoryGroupId: string,
  ): Promise<CategoryGroup | null> {
    return await tx.categoryGroup.findFirst({
      where: {
        id: categoryGroupId,
        userId,
      },
    });
  },

  getCategoryGroupId: async (tx, userId, categoryGroupId) => {
    const found = await tx.categoryGroup.findFirst({
      where: { id: categoryGroupId, userId },
      select: { id: true },
    });
    return found?.id ?? null;
  },

  getProtectedCategoryGroupIds: async (tx, userId) => {
    const groups = await tx.categoryGroup.findMany({
      where: { userId, name: { in: [...PROTECTED_CATEGORY_GROUP_NAMES] } },
    });
    return groups.map((c) => c.id);
  },

  createCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    categoryGroup: CreateCategoryGroupData,
  ): Promise<void> {
    await tx.categoryGroup.create({
      data: categoryGroup,
    });
  },

  getCategoryGroupIdByName: async function (
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
  ): Promise<string | null> {
    const categoryGroup = await tx.categoryGroup.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          notIn: [...PROTECTED_CATEGORY_GROUP_NAMES],
        },
      },
      select: { id: true },
    });

    return categoryGroup?.id ?? null;
  },
  updateCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    data: EditCategoryGroupData,
  ): Promise<void> {
    await tx.categoryGroup.update({
      where: {
        id: data.categoryGroupId,
      },
      data: {
        name: data.name,
      },
    });
  },

  deleteCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: string,
  ): Promise<void> {
    await tx.categoryGroup.delete({
      where: {
        id: categoryGroupId,
      },
    });
  },
};
