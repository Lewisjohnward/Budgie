import request from "supertest";
import app from "../../app";
import { type BudgetHydrationDto } from "../../features/budget/queries/hydration/hydration.types";
import { CategoryDto } from "../../features/budget/core/category/core/types/category.dto";
import { MonthDto } from "../../features/budget/core/category/core/category.types";
import {
  CategoryGroupUserDto,
  CategoryGroupSystemDto,
} from "../../features/budget/core/categorygroup/categoryGroup.types";

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
): Promise<Record<string, CategoryDto>> => {
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
 */
export const getUserCategoryByName = async (
  cookie: string,
  name: string
): Promise<CategoryDto | undefined> => {
  const userCategories = await getUserCategories(cookie);

  return Object.values(userCategories).find((c) => c.name === name);
};

/**
 */
export const getMonthsByCategoryId = async (
  cookie: string,
  categoryId: string
): Promise<MonthDto[]> => {
  const months = await getMonths(cookie);

  return Object.values(months).filter((m) => m.categoryId === categoryId);
};

/**
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
 * Gets inflow category group
 */
export const getInflowCategoryGroup = async (
  cookie: string
): Promise<CategoryGroupSystemDto> => {
  const categoryGroups = await getCategoryGroups(cookie);
  console.log("categoryGroups:", categoryGroups);

  return categoryGroups.inflow;
};
