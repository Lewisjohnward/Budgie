import { PrismaClient } from "@prisma/client";
import { CategoryPayload } from "../../../schemas/CategorySchema";
import { InflowCategoryGroupModificationError } from "../../../errors";

const prisma = new PrismaClient();

export const createCategory = async (category: CategoryPayload) => {
  const inflowCategoryGroup = await prisma.categoryGroup.findFirst({
    where: {
      userId: category.userId,
      name: "Inflow",
    },
  });

  if (!inflowCategoryGroup)
    throw new Error("Unable to find Inflow Category Group ");

  if (inflowCategoryGroup.id === category.categoryGroupId) {
    throw new InflowCategoryGroupModificationError();
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
