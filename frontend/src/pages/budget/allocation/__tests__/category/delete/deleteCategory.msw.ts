import { http, HttpResponse } from "msw";
import { deleteCategoryResult } from "./deleteCategory.utils";
import { getSnapshot } from "../../__helpers__/msw/state";

const API_URL = import.meta.env.VITE_API_URL;

type DeleteCategoryRequest = {
  inheritingCategoryId?: string;
};

export const deleteCategoryHandler = http.delete(
  `${API_URL}/budget/categories/:id`,
  async ({ params, request }) => {
    const categoryId = params.id;

    if (typeof categoryId !== "string") {
      throw new Error("Category id is not a string");
    }

    const body = (await request.json().catch(() => ({}))) as
      | DeleteCategoryRequest
      | undefined;

    const snapshot = getSnapshot();

    const response = deleteCategoryResult(
      snapshot,
      categoryId,
      body?.inheritingCategoryId
    );

    return HttpResponse.json(response);
  }
);
