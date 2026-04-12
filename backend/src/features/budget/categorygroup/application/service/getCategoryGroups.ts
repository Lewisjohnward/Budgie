import { categoryGroupRepository } from "../../../../../shared/repository/categoryGroupRepositoryImpl";
import { type DomainCategoryGroup } from "../../categoryGroup.types";
import { categoryGroupMapper } from "../../categorygroup.mapper";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Retrieves all category groups belonging to a user.
 *
 * This function:
 * - Fetches raw category group records from the repository layer
 * - Maps database rows into domain-level category group entities
 *
 * @param userId - The ID of the user whose category groups should be fetched
 * @returns A list of domain category group entities for the user
 */
export const getCategoryGroups = async (
  userId: UserId
): Promise<DomainCategoryGroup[]> => {
  const rows = await categoryGroupRepository.getCategoryGroups(userId);

  return rows.map(categoryGroupMapper.toDomainCategoryGroup);
};
