import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";
import {
  type DomainSystemCategoryGroup,
  type DomainUserCategoryGroup,
} from "../../categoryGroup.types";
import { CategoryGroupSource } from "../../categoryGroup.constants";
import { UnknownCategoryGroupSourceError } from "../../categoryGroup.errors";

export type CategoryGroupsBySource = {
  user: DomainUserCategoryGroup[];
  system: DomainSystemCategoryGroup[];
};

/**
 * Retrieves all category groups for a user and partitions them by source.
 *
 * This use case:
 * - Loads all category groups for the given user from the repository
 * - Maps persistence models into domain models
 * - Splits results into USER and SYSTEM category groups
 * - Enforces ordering invariants for USER groups (by `position`)
 *
 * Domain invariants enforced:
 * - Only known `CategoryGroupSource` values are allowed
 * - USER groups are always returned in position order
 *
 * @param userId - Strongly-typed identifier of the user
 * @returns A partitioned collection of category groups grouped by source type
 *
 * @throws {UnknownCategoryGroupSourceError}
 * Thrown when a category group has an unsupported or unknown source value,
 * indicating a data integrity issue between persistence and domain model.
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

    throw new UnknownCategoryGroupSourceError(row.source);
  }

  // Ensure ordering invariant for USER groups
  user.sort((a, b) => a.position - b.position);

  return { user, system };
};
