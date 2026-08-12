import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getSnapshot } from "./renameCategory.state";
import { renameCategoryResult } from "./renameCategory.utils";
import { UpdateCategoryInput } from "@/core/api/budget/category/categoryApiSlice";

export type UpdateCategoryBody = Omit<UpdateCategoryInput, "categoryGroupId">;

export const API_URL = import.meta.env.VITE_API_URL;

export const handlers = [
  http.get(`${API_URL}/budget/snapshot`, () => {
    return HttpResponse.json(getSnapshot());
  }),

  http.get(`${API_URL}/budget/categories`, () => {
    return HttpResponse.json(getSnapshot());
  }),

  http.get(`${API_URL}/budget/account`, () => {
    return HttpResponse.json(getSnapshot());
  }),

  http.patch(
    `${API_URL}/budget/categories/:id`,
    async ({ params, request }) => {
      const categoryId = params.id;

      if (typeof categoryId !== "string") {
        throw new Error("id is not a string");
      }

      const body = (await request
        .json()
        .catch(() => ({}))) as UpdateCategoryBody;

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
  ),
];

const server = setupServer(...handlers);

export const setupTestServer = () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
};

export const mockRenameCategoryFailure = () => {
  server.use(
    http.patch(`${API_URL}/budget/categories/:id`, () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
};

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
