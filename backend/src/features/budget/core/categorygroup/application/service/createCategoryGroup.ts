import { Prisma } from "@prisma/client";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type UserId } from "../../../../../user/auth/auth.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { categoryGroupService } from "../../categoryGroup.service";
import {
  type CreateCategoryGroupData,
  type DomainUserCategoryGroup,
} from "../../categoryGroup.types";
import { isUniqueViolation } from "../../../../../../shared/prisma/utils/isUniqueViolation";
import { CategoryGroupNameConflictError } from "../../categoryGroup.errors";

export const createCategoryGroup = async (
  tx: Prisma.TransactionClient,
  payload: { userId: UserId; name: string }
): Promise<DomainUserCategoryGroup> => {
  const position = await categoryGroupService.getNextCategoryGroupPosition(
    tx,
    payload.userId
  );

  const data: CreateCategoryGroupData = {
    userId: payload.userId,
    name: payload.name,
    position,
  };

  try {
    const createdCategoryGroupRaw =
      await categoryGroupRepository.createCategoryGroup(tx, data);
    return categoryGroupMapper.toDomainUserCategoryGroup(
      createdCategoryGroupRaw
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CategoryGroupNameConflictError();
    }
    throw error;
  }
};
