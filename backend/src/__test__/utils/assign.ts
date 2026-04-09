import app from "../../app";
import request from "supertest";
import { type CategoryMonthsMap } from "../../features/budget/assign/assign.types";
import { login, registerUser } from "./auth";
import { getTestCategory } from "./category";
import { type UpdatedMonthsByCategoryDto } from "../../features/budget/category/category.types";

/**
 * Creates a user and returns a monthId
 */
export async function getUnownedMonthId(): Promise<string> {
  const otherUserCredentials = {
    email: "test1@test.com",
    password: "testpasswordABC$",
  };
  await registerUser(otherUserCredentials);
  const otherUserCookie = await login(otherUserCredentials);
  const otherUserTestCategory = await getTestCategory(otherUserCookie);

  expect(otherUserTestCategory).toBeDefined();
  return otherUserTestCategory.months[0];
}

/**
 * Sends month assignment updates to the API and returns the typed response
 */
export async function updateMonthAssignments(
  cookie: string,
  assignments: { monthId: string; assigned: string }[]
) {
  const res = await request(app)
    .patch("/budget/assign")
    .set("Authorization", `Bearer ${cookie}`)
    .send({ assignments });

  return { ...res, body: res.body as UpdatedMonthsByCategoryDto };
}

/**
 * Fetches months for categories and throws on non-2xx responses.
 */
export async function getMonthsForCategories(
  cookie: string,
  categoryIds: string[]
): Promise<CategoryMonthsMap> {
  const res = await request(app)
    .get("/budget/assign")
    .set("Authorization", `Bearer ${cookie}`)
    .query({
      categoryIds,
    });

  if (res.status >= 400) {
    const err: any = new Error(res.body?.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return res.body as CategoryMonthsMap;
}
