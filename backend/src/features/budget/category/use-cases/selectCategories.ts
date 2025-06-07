import { prisma } from "../../../../shared/prisma/client";

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
  return categoryGroups;
};
