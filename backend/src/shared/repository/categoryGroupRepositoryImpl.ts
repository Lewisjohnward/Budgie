import { Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_GROUP_NAMES } from "../../features/budget/categorygroup/categoryGroup.constants";
import { CategoryGroupRepository } from "../../features/budget/categorygroup/categoryGroup.repository";
import {
  type CreateCategoryGroupData,
  type EditCategoryGroupData,
} from "../../features/budget/categorygroup/categorygroup.schema";
import {
  db,
  type CategoryGroupId,
} from "../../features/budget/categorygroup/categoryGroup.types";
import { type UserId } from "../../features/user/auth/auth.types";
import { prisma } from "../prisma/client";

export const categoryGroupRepository: CategoryGroupRepository = {
  getCategoryGroup: async function(
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<db.CategoryGroup | null> {
    const row = await tx.categoryGroup.findFirst({
      where: {
        id: categoryGroupId,
        userId,
      },
    });

    if (!row) {
      return null;
    }

    return row;
  },

  getCategoryGroups: async function(
    userId: UserId
  ): Promise<db.CategoryGroup[]> {
    return prisma.categoryGroup.findMany({
      where: { userId },
    });
  },

  existsCategoryGroup: async (tx, userId, categoryGroupId) => {
    const row = await tx.categoryGroup.findFirst({
      where: { id: categoryGroupId, userId },
      select: { id: true },
    });
    return !!row;
  },

  isProtectedCategoryGroup: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<boolean> => {
    const row = await tx.categoryGroup.findFirst({
      where: {
        id: categoryGroupId,
        userId,
        name: { in: Array.from(PROTECTED_CATEGORY_GROUP_NAMES) },
      },
      select: { id: true },
    });

    return !!row;
  },

  createCategoryGroup: async function(
    tx: Prisma.TransactionClient,
    categoryGroup: CreateCategoryGroupData
  ): Promise<void> {
    await tx.categoryGroup.create({
      data: categoryGroup,
    });
  },

  existsCategoryGroupByName: async function(
    tx: Prisma.TransactionClient,
    userId: UserId,
    name: string
  ): Promise<boolean> {
    const row = await tx.categoryGroup.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          notIn: [...PROTECTED_CATEGORY_GROUP_NAMES],
        },
      },
      select: { id: true },
    });

    return !!row;
  },
  updateCategoryGroup: async function(
    tx: Prisma.TransactionClient,
    data: EditCategoryGroupData
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

  deleteCategoryGroup: async function(
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<void> {
    await tx.categoryGroup.delete({
      where: {
        id: categoryGroupId,
      },
    });
  },
};
