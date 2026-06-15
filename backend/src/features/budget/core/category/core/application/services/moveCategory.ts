import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../category.mapper";
import { DomainCategory, type CategoryId } from "../../category.types";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { InvalidCategoryPositionError } from "../../category.errors";

type MoveCategoryInput = {
  tx: Prisma.TransactionClient;
  userId: UserId;
  categoryId: CategoryId;
  originalGroupId: CategoryGroupId;
  newGroupId: CategoryGroupId;
  fromPosition: number;
  toPosition: number;
};

// TODO:(lewis 2026-06-15 14:29) rename this , chatgpt wrote it because we had been talking about results
export type MoveCategoryResult = {
  updatedCategory: DomainCategory;
  affectedCategories: DomainCategory[];
};
/**
 * Handles all category repositioning logic:
 * - reorder within same group
 * - move between groups
 * - shifts affected categories accordingly
 */
export const moveCategory = async ({
  tx,
  userId,
  categoryId,
  originalGroupId: fromGroupId,
  newGroupId: toGroupId,
  fromPosition,
  toPosition,
}: MoveCategoryInput): Promise<MoveCategoryResult> => {
  const targetGroupSize = await tx.category.count({
    where: {
      userId,
      categoryGroupId: toGroupId,
    },
  });

  if (toPosition < 0 || toPosition >= targetGroupSize) {
    throw new InvalidCategoryPositionError();
  }

  if (fromGroupId === toGroupId) {
    if (fromPosition !== toPosition) {
      if (fromPosition < toPosition) {
        const updated = await tx.category.updateMany({
          where: {
            userId,
            categoryGroupId: fromGroupId,
            position: { gt: fromPosition, lte: toPosition },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Prisma doesn't return rows, so we re-fetch later
      } else {
        await tx.category.updateMany({
          where: {
            userId,
            categoryGroupId: fromGroupId,
            position: { gte: toPosition, lt: fromPosition },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }
    }

    const updated = await categoryRepository.moveCategory(
      tx,
      categoryId,
      toPosition,
      toGroupId
    );

    // collect final state of group
    const affectedCategories = await tx.category.findMany({
      where: {
        userId,
        categoryGroupId: fromGroupId,
      },
    });

    return {
      updatedCategory: categoryMapper.toDomainCategory(updated),
      affectedCategories: affectedCategories.map(
        categoryMapper.toDomainCategory
      ),
    };
  }

  // CROSS GROUP MOVE

  await tx.category.updateMany({
    where: {
      userId,
      categoryGroupId: fromGroupId,
      position: { gt: fromPosition },
    },
    data: {
      position: { decrement: 1 },
    },
  });

  await tx.category.updateMany({
    where: {
      userId,
      categoryGroupId: toGroupId,
      position: { gte: toPosition },
    },
    data: {
      position: { increment: 1 },
    },
  });

  const updated = await categoryRepository.moveCategory(
    tx,
    categoryId,
    toPosition,
    toGroupId
  );

  const affectedCategories = await tx.category.findMany({
    where: {
      userId,
      categoryGroupId: {
        in: [fromGroupId, toGroupId],
      },
    },
  });

  return {
    updatedCategory: categoryMapper.toDomainCategory(updated),
    affectedCategories: affectedCategories.map(categoryMapper.toDomainCategory),
  };
};
