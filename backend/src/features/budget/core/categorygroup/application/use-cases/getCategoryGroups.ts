import { asUserId } from "../../../../../user/auth/auth.types";
import { categoryGroupService } from "../../categoryGroup.service";
import { type CategoryGroupsMap } from "../../types/categoryGroup.dto";
import { normaliseCategoryGroups } from "../../utils/normaliseCategoryGroups";

/**
 * Fetches all category groups for a given user and returns them as a normalized lookup map.
 *
 * This use case:
 * - Converts the raw `userId` string into a strongly-typed `UserId`
 * - Delegates retrieval of category groups to the service layer
 * - Normalizes the result into a key-based map for efficient access
 *
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<CategoryGroupsMap>} A promise that resolves to a map of category groups indexed by their ID
 *
 * @throws {Error} If the `userId` is invalid or the underlying service fails
 */
export const getCategoryGroups = async (
  userId: string
): Promise<CategoryGroupsMap> => {
  const uId = asUserId(userId);

  const categoryGroups = await categoryGroupService.getCategoryGroups(uId);

  return normaliseCategoryGroups(categoryGroups);
};
