import { prisma } from "../../../../../shared/prisma/client";
import {
  CategoryGroupWithCategoriesAndMonths,
  MonthMemo,
} from "../../category.types";

export const selectCategories = async (
  userId: string
): Promise<{
  categoryGroups: CategoryGroupWithCategoriesAndMonths[];
  memos: MonthMemo[];
}> => {
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

  const [categoryGroups, memos] = await prisma.$transaction([
    prisma.categoryGroup.findMany({
      where: { userId },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: { months: { orderBy: { month: "asc" } } },
        },
      },
    }),
    prisma.monthMemo.findMany({
      where: { userId },
      orderBy: { month: "asc" },
      select: {
        id: true,
        month: true,
        content: true,
      },
    }),
  ]);

  return { categoryGroups, memos };
};
