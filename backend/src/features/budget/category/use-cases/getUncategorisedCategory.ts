import { Prisma } from "@prisma/client";

export const getUncategorisedCategory = async (
  tx: Prisma.TransactionClient,
  userId: string,
) => {
  return await tx.category.findFirstOrThrow({
    where: {
      name: "Uncategorised Transactions",
      userId,
    },
  });
};
