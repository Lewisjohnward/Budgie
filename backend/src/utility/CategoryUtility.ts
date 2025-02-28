import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const isValidCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  if (category == null) {
    // TODO: Needs testing
    throw new Error("Invalid category");
  }

  return category;
};
