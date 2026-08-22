import { http, HttpResponse } from "msw";
import { getSnapshot } from "./deleteCategory.state";
import { setupServer } from "msw/node";
import { deleteCategoryResult } from "./deleteCategory.utils";

const API_URL = import.meta.env.VITE_API_URL;

type DeleteCategoryRequest = {
  inheritingCategoryId?: string;
};

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
  http.delete(
    `${API_URL}/budget/categories/:id`,
    async ({ params, request }) => {
      const categoryId = params.id;
      if (typeof categoryId !== "string") {
        throw new Error("id is not a string");
      }

      const body = (await request
        .json()
        .catch(() => ({}))) as DeleteCategoryRequest;

      const inheritingCategoryId = body.inheritingCategoryId;

      const snapshot = getSnapshot();

      const res = deleteCategoryResult(
        snapshot,
        categoryId,
        inheritingCategoryId
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
