import { categoryGroupRepository } from "../../../../../../shared/repository/categoryGroupRepositoryImpl";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type DomainCategoryGroup } from "../../categoryGroup.types";

/**
 * Retrieves all category groups belonging to a user
 *
 * This function:
 * - Fetches raw category group records from the repository layer
 * - Maps database rows into domain-level category group entities
 *
 * @param userId - The ID of the user whose category groups should be fetched
 * @returns A list of domain category group entities
 */
export const getCategoryGroups = async (
  userId: UserId
): Promise<DomainCategoryGroup[]> => {
  const categoryGroupRows =
    await categoryGroupRepository.getCategoryGroups(userId);

  return categoryGroupRows.map(categoryGroupMapper.toDomainCategoryGroup);
};
