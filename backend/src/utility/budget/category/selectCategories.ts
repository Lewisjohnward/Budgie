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
  return categoryGroups;
};
