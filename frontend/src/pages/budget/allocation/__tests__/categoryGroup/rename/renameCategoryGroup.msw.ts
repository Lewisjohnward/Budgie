import { http, HttpResponse } from "msw";
import { renameCategoryGroupResult } from "./renameCategoryGroup.utils";
import { server } from "../../__helpers__/msw/server";
import { UpdateCategoryGroupInput } from "@/core/api/budget/categoryGroup/types";
import { getSnapshot } from "../../__helpers__/msw/state";

export type UpdateCategoryGroupBody = Omit<
  UpdateCategoryGroupInput,
  "categoryGroupId"
>;

const API_URL = import.meta.env.VITE_API_URL;

export const renameCategoryGroupHandler = http.patch(
  `${API_URL}/budget/category-groups/:id`,
  async ({ params, request }) => {
    const categoryGroupId = params.id;

    if (typeof categoryGroupId !== "string") {
      throw new Error("id is not a string");
    }

    const body = (await request
      .json()
      .catch(() => ({}))) as UpdateCategoryGroupBody;

    if (body.position) {
      throw new Error("MSW handler only supports renaming");
    }

    if (!body.name) {
      throw new Error("MSW handler requires body.name");
    }

    const snapshot = getSnapshot();

    const result = renameCategoryGroupResult(
      snapshot,
      categoryGroupId,
      body.name
    );

    return HttpResponse.json(result);
  }
);

export const mockRenameCategoryGroupFailure = () => {
  server.use(
    http.patch(`${API_URL}/budget/category-groups/:id`, () => {
      return new HttpResponse(null, {
        status: 500,
      });
    })
  );
};

export const mockRenameCategoryGroupResponse = (
  transformName: (name: string) => string
) => {
  server.use(
    http.patch(
      `${API_URL}/budget/category-groups/:id`,
      async ({ params, request }) => {
        const categoryGroupId = params.id;

        if (typeof categoryGroupId !== "string") {
          throw new Error("id is not a string");
        }

        const body = (await request.json()) as UpdateCategoryGroupBody;

        if (!body.name) {
          throw new Error("MSW handler requires body.name");
        }

        const snapshot = getSnapshot();

        const result = renameCategoryGroupResult(
          snapshot,
          categoryGroupId,
          transformName(body.name)
        );

        return HttpResponse.json(result);
      }
    )
  );
};
