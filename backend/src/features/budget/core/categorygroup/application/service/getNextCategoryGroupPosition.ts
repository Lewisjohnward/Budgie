import { Prisma } from "@prisma/client";
import { type UserId } from "../../../../../user/auth/auth.types";
import { CategoryGroupSource } from "../../categoryGroup.constants";

export const getNextCategoryGroupPosition = async (
  prisma: Prisma.TransactionClient,
  userId: UserId
): Promise<number> => {
  const latest = await prisma.categoryGroup.findFirst({
    where: {
      userId,
      source: CategoryGroupSource.USER,
      position: {
        not: null,
      },
    },
    orderBy: {
      position: "desc",
    },
    select: {
      position: true,
    },
  });

  return (latest?.position ?? -1) + 1;
};
