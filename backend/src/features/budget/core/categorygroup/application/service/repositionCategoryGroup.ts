import { Prisma } from "@prisma/client";
import { InvalidCategoryGroupPositionError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type DomainUserCategoryGroup } from "../../categoryGroup.types";
import { CategoryGroupSource } from "../../categoryGroup.constants";
import { categoryGroupMapper } from "../../categorygroup.mapper";

export const repositionCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroup: DomainUserCategoryGroup,
  position: number
): Promise<DomainUserCategoryGroup> => {
  const fromPosition = categoryGroup.position;
  const toPosition = position;

  if (toPosition === fromPosition) {
    return categoryGroup;
  }

  const count = await tx.categoryGroup.count({
    where: { userId, source: CategoryGroupSource.USER },
  });

  if (toPosition < 0 || toPosition >= count) {
    throw new InvalidCategoryGroupPositionError();
  }

  if (toPosition > fromPosition) {
    // shift everything up
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
  } else {
    // shift everything down
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
  }

  // place moved item
  const updatedCategoryGroup = await tx.categoryGroup.update({
    where: {
      id: categoryGroup.id,
    },
    data: {
      position: toPosition,
    },
  });

  return categoryGroupMapper.toDomainUserCategoryGroup(updatedCategoryGroup);
};
