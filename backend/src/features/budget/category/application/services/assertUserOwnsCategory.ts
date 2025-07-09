import { Prisma } from "@prisma/client";
import { CategoryNotFoundError } from "../../category.errors";

export const checkUserOwnsCategory = async (
  tx: Prisma.TransactionClient,
  userId: string,
  categoryId: string,
) => {
  const category = await tx.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    throw new CategoryNotFoundError();
  }
};
