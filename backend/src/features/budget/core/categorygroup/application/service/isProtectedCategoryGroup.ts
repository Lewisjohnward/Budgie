import { Prisma } from "@prisma/client";
import { ModifyingAProtectedCategoryGroupError } from "../../categoryGroup.errors";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type CategoryGroupId } from "../../categoryGroup.types";
import { type UserId } from "../../../../../user/auth/auth.types";

// TODO:(lewis 2026-05-21 19:04) change to assert

export const isProtectedCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<void> => {
  const isProtected = await categoryGroupRepository.isProtectedCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  if (isProtected) {
    throw new ModifyingAProtectedCategoryGroupError();
  }
};
