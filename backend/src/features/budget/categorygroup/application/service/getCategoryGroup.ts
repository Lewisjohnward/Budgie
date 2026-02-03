import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import {
  type DomainCategoryGroup,
  type CategoryGroupId,
} from "../../categoryGroup.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { NoCategoryGroupFoundError } from "../../categoryGroup.errors";
import { type UserId } from "../../../../user/auth/auth.types";

export const getCategoryGroup = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryGroupId: CategoryGroupId
): Promise<DomainCategoryGroup> => {
  const rawCategoryGroup = await categoryGroupRepository.getCategoryGroup(
    tx,
    userId,
    categoryGroupId
  );

  if (!rawCategoryGroup) {
    throw new NoCategoryGroupFoundError();
  }

  return categoryGroupMapper.toDomainCategoryGroup(rawCategoryGroup);
};
