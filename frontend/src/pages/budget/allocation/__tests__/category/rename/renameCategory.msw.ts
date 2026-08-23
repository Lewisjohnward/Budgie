import { http, HttpResponse } from "msw";
import { renameCategoryResult } from "./renameCategory.utils";
import { UpdateCategoryInput } from "@/core/api/budget/category/types";
import { server } from "../../__helpers__/msw/server";
import { getSnapshot } from "../../__helpers__/msw/state";

export type UpdateCategoryBody = Omit<UpdateCategoryInput, "categoryGroupId">;

export const API_URL = import.meta.env.VITE_API_URL;

export const renameCategoryHandler = http.patch(
  `${API_URL}/budget/categories/:id`,
  async ({ params, request }) => {
    const categoryId = params.id;

    if (typeof categoryId !== "string") {
      throw new Error("id is not a string");
    }

    const body = (await request.json().catch(() => ({}))) as UpdateCategoryBody;

    if (body.position) {
      throw new Error("MSW handler only supports renaming");
    }

    if (!body.name) {
      throw new Error("MSW handler requires body.name");
    }

    const snapshot = getSnapshot();

    const result = renameCategoryResult(snapshot, categoryId, body.name);

    return HttpResponse.json(result);
  }
);

export const mockRenameCategoryResponse = (
  transformName: (name: string) => string
) => {
  server.use(
    http.patch(
      `${API_URL}/budget/categories/:id`,
      async ({ params, request }) => {
        const categoryId = params.id;

        if (typeof categoryId !== "string") {
          throw new Error("id is not a string");
        }

        const body = (await request.json()) as UpdateCategoryBody;

        if (!body.name) {
          throw new Error("MSW handler requires body.name");
        }

        const snapshot = getSnapshot();

        const result = renameCategoryResult(
          snapshot,
          categoryId,
          transformName(body.name)
        );

        return HttpResponse.json(result);
      }
    )
  );
};
