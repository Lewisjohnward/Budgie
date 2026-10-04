import { type Prisma } from "@prisma/client";
import { type UserId } from "../../../../../../user/auth/auth.types";
import { getMonth } from "../../utils/getMonth";
import { SYSTEM_CATEGORY_GROUPS } from "../../../../categorygroup/categoryGroup.constants";

export const initialiseSystemCategories = async (
  tx: Prisma.TransactionClient,
  userId: UserId
) => {
  const { startOfCurrentMonth, nextMonth } = getMonth();

  for (const group of SYSTEM_CATEGORY_GROUPS) {
    const createdGroup = await tx.categoryGroup.create({
      data: {
        userId,
        name: group.name,
        source: group.source,
      },
    });

    for (const [position, name] of group.categories.entries()) {
      const newCategory = await tx.category.create({
        data: {
          userId,
          categoryGroupId: createdGroup.id,
          name,
          position,
        },
      });

      await tx.month.createMany({
        data: [
          {
            categoryId: newCategory.id,
            month: startOfCurrentMonth,
          },
          {
            categoryId: newCategory.id,
            month: nextMonth,
          },
        ],
      });
    }
  }
};
