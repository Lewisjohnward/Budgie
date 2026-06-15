import request from "supertest";
import app from "../../../app";
import { type UpdateCategoryPayload } from "../../../features/budget/core/category/core/category.schema";
import { type UpdateCategoryDto } from "../../../features/budget/core/category/core/types/category.dto";
import { CATEGORIES_ENDPOINT_URL } from "./category.endpoint";

export type UpdateCategoryPayloadTest = Omit<
  UpdateCategoryPayload,
  "userId" | "categoryId"
>;

type CreateCategoryResponse = {
  body: UpdateCategoryDto;
  status: number;
};

/**
 * Sends a request to update a category, returning the full HTTP response for testing status codes and edge cases
 */
export const updateCategoryRaw = async (
  cookie: string,
  categoryId: string,
  payload: UpdateCategoryPayloadTest
): Promise<CreateCategoryResponse> => {
  const res = await request(app)
    .patch(`${CATEGORIES_ENDPOINT_URL}/${categoryId}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return {
    body: res.body,
    status: res.statusCode,
  };
};
