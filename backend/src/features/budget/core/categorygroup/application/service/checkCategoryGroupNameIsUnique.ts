import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { CategoryGroupNameConflictError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../../user/auth/auth.types";

export const checkCategoryGroupNameIsUnique = async (
  prisma: Prisma.TransactionClient,
  userId: UserId,
  name: string
) => {
  const exists = await categoryGroupRepository.existsCategoryGroupByName(
    prisma,
    userId,
    name
  );

  if (exists) {
    throw new CategoryGroupNameConflictError();
  }
};
