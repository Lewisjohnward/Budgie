import { CategoryGroupSource, type Prisma } from "@prisma/client";
import { type CategoryGroupRepository } from "../../features/budget/core/categorygroup/categoryGroup.repository";
import { type CreateCategoryGroupData } from "../../features/budget/core/categorygroup/categorygroup.schema";
import {
  db,
  type CategoryGroupId,
} from "../../features/budget/core/categorygroup/categoryGroup.types";
import { type UserId } from "../../features/user/auth/auth.types";
import { prisma } from "../prisma/client";

export const categoryGroupRepository: CategoryGroupRepository = {
  getUserCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<db.CategoryGroup | null> {
    const row = await tx.categoryGroup.findFirst({
      where: {
        id: categoryGroupId,
        userId,
        source: CategoryGroupSource.USER,
      },
    });

    if (!row) {
      return null;
    }

    return row;
  },
  getCategoryGroupById: async function (
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

  getCategoryGroups: async function (
    userId: UserId
  ): Promise<db.CategoryGroup[]> {
    return prisma.categoryGroup.findMany({ where: { userId } });
  },

  existsCategoryGroup: async (tx, userId, categoryGroupId) => {
    const row = await tx.categoryGroup.findFirst({
      where: { id: categoryGroupId, userId },
      select: { id: true },
    });
    return !!row;
  },

  isProtectedCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    categoryGroupId: CategoryGroupId
  ): Promise<boolean> {
    const row = await tx.categoryGroup.findFirst({
      where: {
        id: categoryGroupId,
        userId,
        source: CategoryGroupSource.SYSTEM,
      },
      select: { id: true },
    });

    return !!row;
  },

  /**
   * Inserts a new category group record into the database. */
  createCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    data: CreateCategoryGroupData
  ): Promise<db.CategoryGroup> {
    return tx.categoryGroup.create({
      data,
    });
  },

  deleteCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId
  ): Promise<void> {
    await tx.categoryGroup.delete({
      where: {
        id: categoryGroupId,
      },
    });
  },

  renameCategoryGroup: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId,
    name: string
  ): Promise<db.CategoryGroup> {
    return tx.categoryGroup.update({
      where: { id: categoryGroupId },
      data: { name },
    });
  },

  getUserCategoryGroupCount: async function (
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<number> {
    return tx.categoryGroup.count({
      where: { userId, source: CategoryGroupSource.USER },
    });
  },

  updateCategoryGroupPosition: async function (
    tx: Prisma.TransactionClient,
    categoryGroupId: CategoryGroupId,
    position: number
  ): Promise<db.CategoryGroup> {
    return tx.categoryGroup.update({
      where: { id: categoryGroupId },
      data: { position },
    });
  },

  shiftUserCategoryGroupsDown: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    fromPosition: number,
    toPosition: number
  ): Promise<void> {
    await tx.categoryGroup.updateMany({
      where: {
        userId,
        source: CategoryGroupSource.USER,
        position: {
          gt: fromPosition,
          lte: toPosition,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });
  },

  shiftUserCategoryGroupsUp: async function (
    tx: Prisma.TransactionClient,
    userId: UserId,
    fromPosition: number,
    toPosition: number
  ): Promise<void> {
    await tx.categoryGroup.updateMany({
      where: {
        userId,
        source: CategoryGroupSource.USER,
        position: {
          gte: toPosition,
          lt: fromPosition,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });
  },
};
