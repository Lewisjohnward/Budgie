import request from "supertest";
import app from "../../../app";
import { type CreateCategoryPayload } from "../../../features/budget/core/category/core/category.schema";
import { type CreateCategoryDto } from "../../../features/budget/core/category/core/types/category.dto";
import { type TestCategory } from "../types/models";
import { CATEGORIES_ENDPOINT_URL } from "./category.endpoint";

export type CreateCategoryPayloadTest = Omit<CreateCategoryPayload, "userId">;

type CreateCategoryResponse = {
  body: CreateCategoryDto;
  status: number;
};

/**
 * Sends a request to create a category, returning the full HTTP response for testing status codes and edge cases
 */
export const createCategoryRaw = async (
  cookie: string,
  payload: CreateCategoryPayloadTest
): Promise<CreateCategoryResponse> => {
  const res = await request(app)
    .post(CATEGORIES_ENDPOINT_URL)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return {
    body: res.body as CreateCategoryDto,
    status: res.status,
  };
};

/**
 * Creates a category for the authenticated user and returns TestCategory
 */
export const createCategory = async (
  cookie: string,
  payload: CreateCategoryPayloadTest
): Promise<TestCategory> => {
  const res = await createCategoryRaw(cookie, payload);

  const category = res.body.created.category;

  return {
    id: category.id,
    name: category.name,
    categoryGroupId: category.categoryGroupId,
    position: category.position,
  };
};
