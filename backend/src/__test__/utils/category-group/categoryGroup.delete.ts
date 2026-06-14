import request from "supertest";
import app from "../../../app";
import { type DeleteCategoryGroupDto } from "../../../features/budget/core/categorygroup/categoryGroup.types";
import { CATEGORY_GROUPS_ENDPOINT_URL } from "./categoryGroup.endpoint";

type DeleteCategoryGroupResponse = {
  body: DeleteCategoryGroupDto;
  status: number;
};

/**
 * Deletes a category group for the authenticated user.
 */
export const deleteCategoryGroupRaw = async (
  cookie: string,
  id: string,
  inheritingCategoryId?: string
): Promise<DeleteCategoryGroupResponse> => {
  const res = await request(app)
    .delete(`${CATEGORY_GROUPS_ENDPOINT_URL}/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send({ inheritingCategoryId });

  return {
    body: res.body as DeleteCategoryGroupDto,
    status: res.status,
  };
};
