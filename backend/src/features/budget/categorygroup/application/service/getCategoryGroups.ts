import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type DomainCategoryGroupWithCategoryIds } from "../../categoryGroup.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Retrieves all category groups belonging to a user with their associated category IDs.
 *
 * This function:
 * - Fetches raw category group records from the repository layer
 * - Maps database rows into domain-level category group entities
 *
 * @param userId - The ID of the user whose category groups should be fetched
 * @returns A list of domain category group entities including their associated category IDs
 */
export const getCategoryGroups = async (
  userId: UserId
): Promise<DomainCategoryGroupWithCategoryIds[]> => {
  const categoryGroupRows =
    await categoryGroupRepository.getCategoryGroupsWithCategoryIds(userId);

  return categoryGroupRows.map(
    categoryGroupMapper.toDomainCategoryGroupWithCategoryIds
  );
};
