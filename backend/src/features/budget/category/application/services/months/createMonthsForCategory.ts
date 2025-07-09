import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";

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
