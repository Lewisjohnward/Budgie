import { Prisma } from "@prisma/client";
import { CategoryNotFoundError } from "../../category.errors";

// TODO:(lewis 2026-01-26 10:41) this needs renaming and jsdoc, should it be findUnique?
export const checkUserOwnsCategory = async (
  tx: Prisma.TransactionClient,
  userId: string,
  categoryId: string
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

  return category;
};
