import { asCategoryId, type CategoryId } from "../category.types";

/**
 * Converts an array of raw string identifiers into strongly-typed `CategoryId` values.
 */
export const toDomainCategoryIds = (ids: string[]): CategoryId[] => {
  return ids.map((id) => asCategoryId(id));
};
