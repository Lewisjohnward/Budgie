import request from "supertest";
import app from "../../app";
import { type BudgetHydrationDto } from "../../features/budget/queries/hydration/hydration.types";
import { type MonthDto } from "../../features/budget/core/category/core/category.types";
import {
  type CategoryGroupUserDto,
  type CategoryGroupSystemDto,
} from "../../features/budget/core/categorygroup/categoryGroup.types";
import { type CategoryUserDto } from "../../features/budget/core/category/core/types/category.dto";

const SNAPSHOT_ENDPOINT_URL = "/budget/snapshot";

/**
 * Executes a raw HTTP request to fetch the full budget application snapshot.
 *
 * It is primarily intended for integration and controller-level tests where
 * access to status codes, headers, and raw response body is required.
 */
export const getAppSnapshotRaw = async (cookie: string) => {
  const res = await request(app)
    .get(SNAPSHOT_ENDPOINT_URL)
    .set("Authorization", `Bearer ${cookie}`);

  return res;
};

/**
 * Fetches the full application snapshot and returns the hydrated budget state DTO.
 *
 * This is a convenience wrapper around the underlying snapshot request that:
 * - Executes an authenticated request using the provided session cookie
 * - Extracts the response body
 * - Returns a fully hydrated `BudgetHydrationDto`
 */
export const getAppSnapshot = async (
  cookie: string
): Promise<BudgetHydrationDto> => {
  const res = await getAppSnapshotRaw(cookie);
  return res.body;
};

/**
 * Fetches all user categories from the current budget snapshot.
 */
export const getUserCategories = async (
  cookie: string
): Promise<Record<string, CategoryUserDto>> => {
  const snapshot = await getAppSnapshot(cookie);

  return snapshot.categories.user;
};

/**
 * Fetches all user categories from the current budget snapshot.
 */
export const getMonths = async (
  cookie: string
): Promise<Record<string, MonthDto>> => {
  const snapshot = await getAppSnapshot(cookie);

  return snapshot.months;
};

/**
 * Finds a user category by its exact name.
 */
export const getUserCategoryByName = async (
  cookie: string,
  name: string
): Promise<CategoryUserDto | undefined> => {
  const userCategories = await getUserCategories(cookie);

  return Object.values(userCategories).find((c) => c.name === name);
};

/**
 * Finds a user category by its unique ID.
 */
export const getUserCategoryById = async (
  cookie: string,
  id: string
): Promise<CategoryUserDto | undefined> => {
  const userCategories = await getUserCategories(cookie);
  return Object.values(userCategories).find((c) => c.id === id);
};

/**
 * Fetches a user category by its unique ID, or throws an error if it does not exist.
 */
export const getUserCategoryByIdOrThrow = async (
  cookie: string,
  id: string
) => {
  const category = await getUserCategoryById(cookie, id);
  if (!category) throw new Error(`Category ${id} not found`);
  return category;
};

/**
 * Filters and returns all user categories belonging to a specific category group.
 */
export const getUserCategoriesByCategoryGroupId = async (
  cookie: string,
  categoryGroupId: string
) => {
  const allCategories = await getUserCategories(cookie);
  return Object.values(allCategories).filter(
    (c) => c.categoryGroupId === categoryGroupId
  );
};

/**
 * Fetches all historical month records associated with a specific category ID.
 */
export const getMonthsByCategoryId = async (
  cookie: string,
  categoryId: string
): Promise<MonthDto[]> => {
  const months = await getMonths(cookie);

  return Object.values(months).filter((m) => m.categoryId === categoryId);
};

/**
 * Fetches the categorized group map slices (user, inflow, uncategorised) from the snapshot.
 */
export const getCategoryGroups = async (
  cookie: string
): Promise<{
  user: Record<string, CategoryGroupUserDto>;
  inflow: CategoryGroupSystemDto;
  uncategorised: CategoryGroupSystemDto;
}> => {
  const snapshot = await getAppSnapshot(cookie);

  return snapshot.categoryGroups;
};

/**
 * Fetches a user category group by its ID, or throws an error if it does not exist.
 */
export const getUserCategoryGroupByIdOrThrow = async (
  cookie: string,
  categoryGroupId: string
): Promise<CategoryGroupUserDto> => {
  const categoryGroups = await getCategoryGroups(cookie);

  const categoryGroup = categoryGroups.user[categoryGroupId];

  if (!categoryGroup)
    throw new Error(`CategoryGroup ${categoryGroupId} not found`);

  return categoryGroup;
};

/**
 * Finds a user category group by its exact name.
 */
export const getUserCategoryGroupByName = async (
  cookie: string,
  name: string
): Promise<CategoryGroupUserDto | undefined> => {
  const categoryGroups = await getCategoryGroups(cookie);

  const categoryGroup = Object.values(categoryGroups.user).find(
    (g) => g.name === name
  );

  return categoryGroup;
};

/**
 * Gets inflow category group
 */
export const getInflowCategoryGroup = async (
  cookie: string
): Promise<CategoryGroupSystemDto> => {
  const categoryGroups = await getCategoryGroups(cookie);

  return categoryGroups.inflow;
};
