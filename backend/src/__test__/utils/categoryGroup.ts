import request, { Response } from "supertest";
import app from "../../app";
import {
  CategoryGroupsMap,
  CategoryGroupSystemMap,
  CategoryGroupUserDto,
  CategoryGroupUserMap,
  DeleteCategoryGroupDto,
} from "../../features/budget/core/categorygroup/types/categoryGroup.dto";
import {
  CreateCategoryGroupPayload,
  UpdateCategoryGroupPayload,
} from "../../features/budget/core/categorygroup/categorygroup.schema";

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
  "userId" | "categoryGroupId"
>;

/**
 * Updates a category group and returns the raw HTTP response.
 */
export const updateCategoryGroupRaw = async (
  cookie: string,
  id: string,
  payload?: UpdateCategoryGroupPayloadTest
): Promise<Response> => {
  const res = await request(app)
    .patch(`/budget/categorygroups/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res;
};

/**
 * Updates a category group and returns the dto.
 */
export const updateCategoryGroup = async (
  cookie: string,
  id: string,
  payload?: UpdateCategoryGroupPayloadTest
): Promise<CategoryGroupUserDto> => {
  const res = await request(app)
    .patch(`/budget/categorygroups/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res.body;
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

/**
 * Creates a category group and returns the raw HTTP response.
 */
export const createCategoryGroupRaw = async (
  cookie: string,
  payload: CreateCategoryGroupPayloadTest
): Promise<Response> => {
  const res = await request(app)
    .post("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res;
};

/*
 * Create category group for the user
 */
export const createCategoryGroup = async (
  cookie: string,
  payload: CreateCategoryGroupPayloadTest
): Promise<CategoryGroupUserDto> => {
  const res = await request(app)
    .post("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  expect(res.statusCode).toBe(201);

  return res.body;
};

/**
 * Finds a category group by name within a user category group map.
 */
export const findCategoryGroupByName = (
  groups: CategoryGroupUserMap,
  name: string
): CategoryGroupUserDto | undefined => {
  return Object.values(groups).find((g) => g.name === name);
};

/**
 * Fetches category groups and returns the one matching the given name, or throws if not found.
 */
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

/**
 * Creates a set of test category groups for use in integration tests.
 */
export const createTestCategoryGroups = async (cookie: string) => {
  const { body: body1 } = await createCategoryGroupRaw(cookie, { name: "A" });
  const { body: body2 } = await createCategoryGroupRaw(cookie, { name: "B" });
  const { body: body3 } = await createCategoryGroupRaw(cookie, { name: "C" });

  return {
    g1: body1 as CategoryGroupUserDto,
    g2: body2 as CategoryGroupUserDto,
    g3: body3 as CategoryGroupUserDto,
  };
};

/**
 * Deletes a category group for the authenticated user.
 */
export const deleteCategoryGroupRaw = async (
  cookie: string,
  id: string,
  inheritingCategoryId?: string
): Promise<Response> => {
  const res = await request(app)
    .delete(`/budget/categorygroups/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send({ inheritingCategoryId });

  return res;
};

/**
 * Deletes a category group for the authenticated user.
 */
export const deleteCategoryGroup = async (
  cookie: string,
  id: string,
  inheritingCategoryId?: string
): Promise<DeleteCategoryGroupDto> => {
  const res = await request(app)
    .delete(`/budget/categorygroups/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send({ inheritingCategoryId });

  expect(res.status).toBe(200);

  return res.body;
};

/**
 * Deletes a category group and returns updated category groups state.
 */
export const deleteCategoryGroupAndGetState = async (
  cookie: string,
  id: string
) => {
  const res = await deleteCategoryGroupRaw(cookie, id);

  const after = await getCategoryGroups(cookie);

  return { res, after };
};
