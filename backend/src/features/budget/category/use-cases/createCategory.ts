import {
  AddingTransactionToProtectedCategoryGroupError,
  DuplicateCategoryNameError,
  UnableToFindProtectedCategoriesInDBError,
} from "../category.errors";
import { CategoryPayload } from "../category.schema";
import { prisma } from "../../../../shared/prisma/client";

export const createCategory = async (category: CategoryPayload) => {
  const protectedCategoryGroups = await prisma.categoryGroup.findMany({
    where: {
      userId: category.userId,
      name: {
        in: ["Inflow", "Uncategorised"],
      },
    },
  });
  if (protectedCategoryGroups.length === 0)
    throw new UnableToFindProtectedCategoriesInDBError();

  const protectedGroupIds = new Set(
    protectedCategoryGroups.map((group) => group.id),
  );

  if (protectedGroupIds.has(category.categoryGroupId)) {
    throw new AddingTransactionToProtectedCategoryGroupError();
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      categoryGroupId: category.categoryGroupId,
      name: category.name,
    },
  });

  if (existingCategory) {
    throw new DuplicateCategoryNameError();
  }

  const newCategory = await prisma.category.create({
    data: category,
  });

  const existingMonths = await prisma.month.findMany({
    where: {
      category: {
        userId: category.userId,
      },
    },
    select: {
      month: true,
    },
  });

  const uniqueMonths = [
    ...new Set(existingMonths.map((item) => item.month.toISOString())),
  ];

  Promise.all(
    uniqueMonths.map((month) =>
      prisma.month.create({
        data: {
          categoryId: newCategory.id,
          month: month,
        },
      }),
    ),
  );
};
