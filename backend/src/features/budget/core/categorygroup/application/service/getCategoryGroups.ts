import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";
import {
  DomainSystemCategoryGroup,
  DomainUserCategoryGroup,
} from "../../categoryGroup.types";
import { CategoryGroupSource } from "../../categoryGroup.constants";

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
      continue;
    }

    if (row.source === CategoryGroupSource.SYSTEM) {
      system.push(categoryGroupMapper.toDomainSystemCategoryGroup(row));
      continue;
    }

    throw new Error(`Unknown category group source: ${row.source}`);
  }

  // Ensure ordering invariant for USER groups
  user.sort((a, b) => a.position - b.position);

  return { user, system };
};
