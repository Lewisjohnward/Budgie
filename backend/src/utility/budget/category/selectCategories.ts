import { PrismaClient } from "@prisma/client";
import { convertDecimalToNumber } from "../helpers/convertDecimalToNumber";

const prisma = new PrismaClient();

export const selectCategories = async (userId: string) => {
  const categoryGroups = await prisma.categoryGroup.findMany({
    where: {
      userId,
    },
    include: {
      categories: {
        include: {
          months: {
            orderBy: {
              month: "asc",
            },
          },
        },
      },
    },
  });

  const categories = categoryGroups.map((group) => ({
    ...group,
    categories: group.categories.map((category) => ({
      ...category,
      assigned: convertDecimalToNumber(category.assigned),
      activity: convertDecimalToNumber(category.activity),
      months: category.months.map((month) => ({
        ...month,
        activity: convertDecimalToNumber(month.activity),
        assigned: convertDecimalToNumber(month.assigned),
      })),
    })),
  }));

  return categories;
};
