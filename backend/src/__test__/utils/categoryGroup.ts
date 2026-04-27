import request from "supertest";
import app from "../../app";
import { CategoryGroupMap } from "../../features/budget/core/categorygroup/types/categoryGroup.dto";

/**
 * Sends a raw request to fetch category groups, returning the full HTTP response for testing status codes and edge cases
 */
export const getCategoryGroupsRaw = async (cookie?: string) => {
  return request(app)
    .get("/budget/categorygroups")
    .set("Authorization", cookie ? `Bearer ${cookie}` : "");
};

/**
 * Fetches all category groups for the authenticated user and returns them as a keyed map by id
 */
export const getCategoryGroups = async (
  cookie: string
): Promise<CategoryGroupMap> => {
  const res = await request(app)
    .get("/budget/categorygroups")
    .set("Authorization", `Bearer ${cookie}`);

  expect(res.statusCode).toBe(200);

  return res.body as CategoryGroupMap;
};
