import { Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_GROUP_NAMES } from "../../categoryGroup.constants";

export const getNextCategoryGroupPosition = async (
  prisma: Prisma.TransactionClient,
  userId: string,
) => {
  //TODO: SEPARATE OUT RTA CAT AND UNCATEGORISED?
  const latest = await prisma.categoryGroup.findFirst({
    where: {
      userId,
      name: {
        notIn: [...PROTECTED_CATEGORY_GROUP_NAMES],
      },
    },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return latest !== null ? latest.position + 1 : 0;
};
