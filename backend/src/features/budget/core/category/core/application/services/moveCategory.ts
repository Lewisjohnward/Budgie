import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../category.mapper";
import { type CategoryId } from "../../category.types";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";
import { type UserId } from "../../../../../../user/auth/auth.types";

type MoveCategoryInput = {
  tx: Prisma.TransactionClient;
  userId: UserId;
  categoryId: CategoryId;
  originalGroupId: CategoryGroupId;
  newGroupId: CategoryGroupId;
  fromPosition: number;
  toPosition: number;
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
}: MoveCategoryInput) => {
  // Same group reorder
  if (fromGroupId === toGroupId) {
    if (fromPosition !== toPosition) {
      if (fromPosition < toPosition) {
        await tx.category.updateMany({
          where: {
            userId,
            categoryGroupId: fromGroupId,
            position: {
              gt: fromPosition,
              lte: toPosition,
            },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      } else {
        await tx.category.updateMany({
          where: {
            userId,
            categoryGroupId: fromGroupId,
            position: {
              gte: toPosition,
              lt: fromPosition,
            },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }
    }

    // Place moved group
    const updatedCategoryGroup = await categoryRepository.moveCategory(
      tx,
      categoryId,
      toPosition,
      toGroupId
    );

    return categoryMapper.toDomainCategory(updatedCategoryGroup);
  }

  // move across groups

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

  // Place moved group
  const updatedCategoryGroup = await categoryRepository.moveCategory(
    tx,
    categoryId,
    toPosition,
    toGroupId
  );

  return categoryMapper.toDomainCategory(updatedCategoryGroup);
};
