import { Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_GROUP_NAMES } from "../../categoryGroup.constants";
import { type UserId } from "../../../../user/auth/auth.types";

export const getNextCategoryGroupPosition = async (
  prisma: Prisma.TransactionClient,
  userId: UserId
) => {
  //TODO: SEPARATE OUT RTA CAT AND UNCATEGORISED?
  // todo this should be in the repo!!
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
