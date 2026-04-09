import { prisma } from "../../../../../../shared/prisma/client";
import { UserId } from "../../../../../user/auth/auth.types";
import { getMonth } from "../../utils/getMonth";

// TODO: NEEDS TO BE CLEANED UP REPOSITORY
export const initialiseCategories = async (userId: UserId) => {
  const { startOfCurrentMonth, nextMonth } = getMonth();
  const categoryGroupData = [
    {
      name: "Inflow",
      categories: ["Ready to Assign"],
      position: 0,
    },
    {
      name: "Uncategorised",
      categories: ["Uncategorised Transactions"],
      position: 0,
    },
    {
      name: "Bills",
      categories: ["🏠 Rent/Mortgage", "🔌 Utilities"],
      position: 0,
    },
    {
      name: "Other",
      categories: ["❗️ Stuff I forgot to budget for"],
      position: 1,
    },
  ];

  await prisma.$transaction(async (tx) => {
    for (const group of categoryGroupData) {
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
  });
};
