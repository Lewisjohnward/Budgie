import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../shared/repository/categoryRepositoryImpl";
import { DuplicateCategoryNameError } from "../category.errors";

export const assertCategoryNameIsUniqueInGroup = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryGroupId: string,
  name: string,
) => {
  const existingCategory = await categoryRepository.getCategoryId(
    prisma,
    userId,
    categoryGroupId,
    name,
  );

  if (existingCategory) {
    throw new DuplicateCategoryNameError();
  }
};

export const createMonthsForCategory = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  categoryId: string,
) => {
  const existingMonths = await categoryRepository.getExistingMonths(
    prisma,
    userId,
  );

  const uniqueMonths = [
    ...new Set(existingMonths.map((item) => item.month.toISOString())),
  ];

  const newMonths: Prisma.MonthCreateManyInput[] = uniqueMonths.map(
    (monthStr) => ({
      categoryId,
      month: new Date(monthStr),
    }),
  );

  await categoryRepository.createMonths(prisma, newMonths);
};
