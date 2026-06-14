import request from "supertest";
import app from "../../../app";
import { DeleteCategoryPayload } from "../../../features/budget/core/category/core/category.schema";
import { DeleteCategoryDto } from "../../../features/budget/core/category/core/types/category.dto";
import { CATEGORIES_ENDPOINT_URL } from "./category.endpoint";

type DeleteCategoryResponse = {
  body: DeleteCategoryDto;
  status: number;
};

export type DeleteCategoryPayloadTest = Omit<
  DeleteCategoryPayload,
  "userId" | "categoryId"
>;
/**
 * Sends a request to delete a category, returning the full HTTP response for testing status codes and edge cases
 */
export const deleteCategoryRaw = async (
  cookie: string,
  categoryId: string,
  payload?: DeleteCategoryPayloadTest
): Promise<DeleteCategoryResponse> => {
  const res = await request(app)
    .delete(`${CATEGORIES_ENDPOINT_URL}/${categoryId}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return {
    body: res.body as DeleteCategoryDto,
    status: res.status,
  };
};
