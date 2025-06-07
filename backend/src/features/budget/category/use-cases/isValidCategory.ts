import { prisma } from "../../../../shared/prisma/client";

export const isValidCategory = async (userId: string, categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
      userId,
    },
  });
  if (category == null) {
    // TODO: Needs testing
    throw new Error("Invalid category");
  }

  return category;
};
