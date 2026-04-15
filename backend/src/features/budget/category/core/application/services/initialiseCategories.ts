import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../../user/auth/auth.types";
import { getMonth } from "../../utils/getMonth";
import { DEFAULT_CATEGORY_GROUPS } from "../../../../categorygroup/categoryGroup.constants";

// TODO: NEEDS TO BE CLEANED UP REPOSITORY
export const initialiseCategories = async (
  tx: Prisma.TransactionClient,
  userId: UserId
) => {
  const { startOfCurrentMonth, nextMonth } = getMonth();

  for (const group of DEFAULT_CATEGORY_GROUPS) {
    const createdGroup = await tx.categoryGroup.create({
      data: {
        userId,
        name: group.name,
        position: group.position,
      },
    });

    let position = 0;

    for (const name of group.categories) {
      const newCategory = await tx.category.create({
        data: {
          userId,
          categoryGroupId: createdGroup.id,
          name,
          position,
        },
      });

      await tx.month.create({
        data: {
          categoryId: newCategory.id,
          month: startOfCurrentMonth,
        },
      });

      await tx.month.create({
        data: {
          categoryId: newCategory.id,
          month: nextMonth,
        },
      });
      position++;
    }
    position = 0;
  }
};
