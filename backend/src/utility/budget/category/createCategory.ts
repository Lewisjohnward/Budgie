import { PrismaClient } from "@prisma/client";
import { getMonth } from "..";
import { CategoryPayload } from "../../../schemas/CategorySchema";

const prisma = new PrismaClient();

export const createCategory = async (category: CategoryPayload) => {
  const newCategory = await prisma.category.create({
    data: category,
  });

  const { startOfCurrentMonth, nextMonth } = getMonth();

  await prisma.month.create({
    data: {
      categoryId: newCategory.id,
      month: startOfCurrentMonth,
    },
  });

  await prisma.month.create({
    data: {
      categoryId: newCategory.id,
      month: nextMonth,
    },
  });
};
