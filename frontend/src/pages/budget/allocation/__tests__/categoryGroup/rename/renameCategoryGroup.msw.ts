import { http, HttpResponse } from "msw";
import { getSnapshot } from "./renameCategoryGroup.state";
import { setupServer } from "msw/node";
import { renameCategoryGroupResult } from "./renameCategoryGroup.utils";
import {
  UpdateCategoryGroupBody,
  UpdateCategoryGroupDto,
} from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";

const API_URL = import.meta.env.VITE_API_URL;

export const handlers = [
  http.get(`${API_URL}/budget/snapshot`, () => {
    const snapshot = getSnapshot();
    return HttpResponse.json(snapshot);
  }),
  http.get(`${API_URL}/budget/categories`, () => {
    return HttpResponse.json(getSnapshot());
  }),
  http.get(`${API_URL}/budget/account`, () => {
    return HttpResponse.json(getSnapshot());
  }),
  http.patch(
    `${API_URL}/budget/category-groups/:id`,
    async ({ params, request }) => {
      const categoryGroupId = params.id;
      if (typeof categoryGroupId !== "string") {
        throw new Error("id is not a string");
      }

      const body = (await request
        .json()
        .catch(() => ({}))) as UpdateCategoryGroupBody;
      console.log("body:", body);

      if (body.position) {
        throw new Error("MSW handler only supports renaming");
      }
      if (!body.name) {
        throw new Error("MSW handler requires body.name");
      }

      const snapshot = getSnapshot();

      const res = renameCategoryGroupResult(
        snapshot,
        categoryGroupId,
        body.name
      );

      return HttpResponse.json(res);
    }
  ),
];

export const setupTestServer = () => {
  const server = setupServer(...handlers);

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  return server;
};
