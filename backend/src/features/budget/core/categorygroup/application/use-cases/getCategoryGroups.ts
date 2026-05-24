import { asUserId } from "../../../../../user/auth/auth.types";
import { categoryGroupService } from "../../categoryGroup.service";
import { CategoryGroupsMap } from "../../types/categoryGroup.dto";
import { normaliseCategoryGroups } from "../../utils/normaliseCategoryGroups";

// TODO:(lewis 2026-05-22 04:29) this needs changing
/**
 * Retrieves all category groups for a user and returns them as a normalized lookup map.
 *
 * This use case:
 * - Converts the raw `userId` into a strongly-typed domain `UserId`
 * - Fetches category groups from the service layer
 *
 * @param userId - The ID of the user whose category groups should be retrieved
 * @returns A record of category groups indexed by their ID
 */
export const getCategoryGroups = async (
  userId: string
): Promise<CategoryGroupsMap> => {
  const uId = asUserId(userId);

  const categoryGroups = await categoryGroupService.getCategoryGroups(uId);

  return normaliseCategoryGroups(categoryGroups);
};
