import { prisma } from "../../../../../shared/prisma/client";

export const selectCategories = async (userId: string) => {
  // const groups = await getCategoryGroupsByUserId(userId);
  // const groupIds = groups.map((g) => g.id);
  //
  // const categories = await getCategoriesByGroupIds(groupIds);
  // const categoryIds = categories.map((c) => c.id);
  //
  // const months = await getCategoryMonthsByCategoryIds(categoryIds);
  //
  // // merge and structure nested tree here
  // return buildCategoryTree(groups, categories, months);

  const categoryGroups = await prisma.categoryGroup.findMany({
    where: {
      userId,
    },
    include: {
      categories: {
        orderBy: {
          position: "asc",
        },
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
