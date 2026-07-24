import { http, HttpResponse } from "msw";
import { getSnapshot } from "./state";
import { setupServer } from "msw/node";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { DeleteCategoryDto } from "@/core/api/budget/category/categoryApiSlice";
import {
  CategoryBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import { rtaCategoryIdTest } from "./createBudgetSnapshot";
import { CategoryId } from "../../../types/types";

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

      const res = deleteCategory(snapshot, categoryId, inheritingCategoryId);

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

function deleteCategory(
  snapshot: ApiBudgetSnapshot,
  id: string,
  inheritingCategoryId?: string
): DeleteCategoryDto {
  const category = snapshot.categories.user[id] as CategoryBranded;

  const monthsForCategory = Object.fromEntries(
    Object.entries(snapshot.months).filter(([_, m]) => m.categoryId === id)
  ) as Record<string, MonthBranded>;

  const updatedCategories = { ...snapshot.categories.user } as Record<
    string,
    CategoryBranded
  >;

  delete updatedCategories[id];

  const assignedTotal = Object.values(snapshot.months)
    .filter((m) => m.categoryId === id)
    .reduce((sum, m) => sum + m.assigned, 0);

  const rtaMonthId = Object.keys(snapshot.months).find(
    (id) => snapshot.months[id].categoryId === rtaCategoryIdTest
  );

  const updatedMonths = structuredClone(snapshot.months);

  const updatedTransactions = structuredClone(snapshot.transactions) as Record<
    string,
    TransactionBranded
  >;

  //-----
  // Reassign transactions + month values
  //-----
  if (inheritingCategoryId) {
    const deletedMonth = Object.values(monthsForCategory)[0];

    const inheritingMonth = Object.values(updatedMonths).find(
      (month) => month.categoryId === inheritingCategoryId
    );

    if (deletedMonth && inheritingMonth) {
      inheritingMonth.activity += deletedMonth.activity;
      inheritingMonth.available += deletedMonth.activity;
    }

    Object.values(updatedTransactions).forEach((transaction) => {
      if (transaction.categoryId === id) {
        transaction.categoryId = inheritingCategoryId as CategoryId;
      }
    });
  }

  //-----
  // remove deleted categories
  //-----
  for (const monthId of Object.keys(monthsForCategory)) {
    delete updatedMonths[monthId];
  }

  //-----
  // update rta
  //-----
  if (rtaMonthId) {
    updatedMonths[rtaMonthId].available += assignedTotal;
  }

  return {
    deleted: {
      category,
      months: monthsForCategory,
    },
    updated: {
      // TODO:(lewis 2026-07-23 15:12) this is not needed
      categories: updatedCategories,
      transactions: updatedTransactions,
      months: updatedMonths as Record<string, MonthBranded>,
    },
  };
}
