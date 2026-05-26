import { Prisma } from "@prisma/client";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import {
  CategoryGroupId,
  DomainUserCategoryGroup,
} from "../../categoryGroup.types";
import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { CategoryGroupNameConflictError } from "../../categoryGroup.errors";
import { isUniqueViolation } from "../../../../../../shared/prisma/utils/isUniqueViolation";

export const renameCategoryGroup = async (
  tx: Prisma.TransactionClient,
  categoryGroupId: CategoryGroupId,
  name: string
): Promise<DomainUserCategoryGroup> => {
  try {
    const renamedCategoryGroupRaw =
      await categoryGroupRepository.renameCategoryGroup(
        tx,
        categoryGroupId,
        name
      );

    return categoryGroupMapper.toDomainUserCategoryGroup(
      renamedCategoryGroupRaw
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CategoryGroupNameConflictError();
    }
    throw error;
  }
};
