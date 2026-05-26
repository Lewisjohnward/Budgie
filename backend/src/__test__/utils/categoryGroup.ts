import request, { Response } from "supertest";
import app from "../../app";
import {
  CategoryGroupsMap,
  CategoryGroupSystemMap,
  CategoryGroupUserDto,
  CategoryGroupUserMap,
} from "../../features/budget/core/categorygroup/types/categoryGroup.dto";
import {
  CreateCategoryGroupPayload,
  UpdateCategoryGroupPayload,
} from "../../features/budget/core/categorygroup/categorygroup.schema";

// low-level CRUD
// createCategoryGroup()
// getCategoryGroups()
// updateCategoryGroup()

/**
 * Sends a raw request to fetch category groups, returning the full HTTP response for testing status codes and edge cases
 */
export const getCategoryGroupsRaw = async (
  cookie?: string
): Promise<Response> => {
  return request(app)
    .get("/budget/categorygroups")
    .set("Authorization", cookie ? `Bearer ${cookie}` : "");
};

/**
 * Fetches all category groups for the authenticated user and returns them as a keyed map by id
 */
export const getCategoryGroups = async (
  cookie: string
): Promise<CategoryGroupsMap> => {
  const res = await request(app)
    .get("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`);

  expect(res.statusCode).toBe(200);

  return res.body as CategoryGroupsMap;
};

/**
 * Test version of UpdateCategoryGroupPayload.
 *
 * Omits `userId` because it is derived internally from the authentication cookie
 * and is not provided directly in test requests.
 */
type UpdateCategoryGroupPayloadTest = Omit<
  UpdateCategoryGroupPayload,
  "userId"
>;

/**
 * Fetches all category groups for the authenticated user and returns them as a keyed map by id
 */
export const updateCategoryGroup = async (
  cookie: string,
  payload?: UpdateCategoryGroupPayloadTest
): Promise<Response> => {
  const res = await request(app)
    .patch("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res;
};

/*
 * Fetches protected category groups for the user
 */
export const getProtectedCategoryGroups = async (
  cookie: string
): Promise<CategoryGroupSystemMap> => {
  const categoryGroupsMap = await getCategoryGroups(cookie);
  return categoryGroupsMap.system;
};

/*
 * Fetches test category group for the user
 */
export const getTestCategoryGroup = async (
  cookie: string
): Promise<CategoryGroupUserDto> => {
  const categoryGroupsMap = await getCategoryGroups(cookie);

  const categoryGroup = Object.values(categoryGroupsMap.user).find(
    (group) => group.name === "test category group"
  );

  if (!categoryGroup) {
    throw new Error('Could not find category group "test category group"');
  }

  return categoryGroup;
};

/**
 * Test version of UpdateCategoryGroupPayload.
 *
 * Omits `userId` because it is derived internally from the authentication cookie
 * and is not provided directly in test requests.
 */
type CreateCategoryGroupPayloadTest = Omit<
  CreateCategoryGroupPayload,
  "userId"
>;

/*
 * Create category group for the user
 */
export const createCategoryGroup = async (
  cookie: string,
  payload: CreateCategoryGroupPayloadTest
): Promise<Response> => {
  const res = await request(app)
    .post("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res;
};

export const findCategoryGroupByName = (
  groups: CategoryGroupUserMap,
  name: string
): CategoryGroupUserDto | undefined => {
  return Object.values(groups).find((g) => g.name === name);
};

export const getCategoryGroupByNameOrThrow = async (
  cookie: string,
  name: string
): Promise<CategoryGroupUserDto> => {
  const groups = await getCategoryGroups(cookie);

  const group = findCategoryGroupByName(groups.user, name);

  if (!group) {
    throw new Error(`Could not find category group "${name}"`);
  }

  return group;
};
