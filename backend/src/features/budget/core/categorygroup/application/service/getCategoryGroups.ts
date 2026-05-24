import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";
import {
  DomainSystemCategoryGroup,
  DomainUserCategoryGroup,
} from "../../categoryGroup.types";
import { CategoryGroupSource } from "@prisma/client";

export type CategoryGroupsBySource = {
  user: DomainUserCategoryGroup[];
  system: DomainSystemCategoryGroup[];
};

/**
 * Retrieves all category groups belonging to a user,
 * split into USER (ordered) and SYSTEM (fixed) groups.
 */
export const getCategoryGroups = async (
  userId: UserId
): Promise<CategoryGroupsBySource> => {
  const rows = await categoryGroupRepository.getCategoryGroups(userId);

  const user: DomainUserCategoryGroup[] = [];
  const system: DomainSystemCategoryGroup[] = [];

  for (const row of rows) {
    if (row.source === CategoryGroupSource.USER) {
      user.push(categoryGroupMapper.toDomainUserCategoryGroup(row));
    } else {
      system.push(categoryGroupMapper.toDomainSystemCategoryGroup(row));
    }
  }

  // Ensure ordering invariant for USER groups
  user.sort((a, b) => a.position - b.position);

  return { user, system };
};
