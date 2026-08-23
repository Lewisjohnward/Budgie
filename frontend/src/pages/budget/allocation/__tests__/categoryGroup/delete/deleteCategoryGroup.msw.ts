import { http, HttpResponse } from "msw";
import { calculateDeleteCategoryGroupResult } from "./deleteCategoryGroup.utils";
import { getSnapshot } from "../../__helpers__/msw/state";

const API_URL = import.meta.env.VITE_API_URL;

type DeleteCategoryGroupRequest = {
  inheritingCategoryId?: string;
};

export const deleteCategoryGroupHandler = http.delete(
  `${API_URL}/budget/category-groups/:id`,
  async ({ params, request }) => {
    const categoryGroupId = params.id;
    if (typeof categoryGroupId !== "string") {
      throw new Error("id is not a string");
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as DeleteCategoryGroupRequest;

    const inheritingCategoryId = body.inheritingCategoryId;

    const snapshot = getSnapshot();

    const res = calculateDeleteCategoryGroupResult(
      snapshot,
      categoryGroupId,
      inheritingCategoryId
    );

    return HttpResponse.json(res);
  }
);
