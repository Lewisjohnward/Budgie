import { getMonth } from "../utils/getMonth";
import { prisma } from "../../../../shared/prisma/client";

export const initialiseCategories = async (userId: string) => {
  const { startOfCurrentMonth, nextMonth } = getMonth();
  const categoryGroupData = [
    {
      name: "Inflow",
      categories: ["Ready to Assign"],
    },
    {
      name: "Uncategorised",
      categories: ["Uncategorised Transactions"],
    },
    {
      name: "Bills",
      categories: ["🏠 Rent/Mortgage", "🔌 Utilities"],
    },
    {
      name: "Other",
      categories: ["❗️ Stuff I forgot to budget for"],
    },
  ];

  await prisma.$transaction(async (tx) => {
    for (const group of categoryGroupData) {
      const createdGroup = await tx.categoryGroup.create({
        data: {
          userId,
          name: group.name,
        },
      });

      for (const name of group.categories) {
        const newCategory = await tx.category.create({
          data: {
            userId,
            categoryGroupId: createdGroup.id,
            name,
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
      }
    }
  });
};
