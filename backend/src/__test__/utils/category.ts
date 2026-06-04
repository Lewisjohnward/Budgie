import request, { type Response } from "supertest";
import app from "../../app";
import { getCategories } from "./getData";
import { type CreateCategoryPayload } from "../../features/budget/core/category/core/category.schema";
import { type CreateCategoryDto } from "../../features/budget/core/category/core/types/category.dto";

const CATEGORIES_ENDPOINT_URL = "/budget/categories";

export type CreateCategoryPayloadTest = Omit<CreateCategoryPayload, "userId">;

export const createCategoryRaw = async (
  cookie: string,
  payload: CreateCategoryPayloadTest
): Promise<Response> => {
  return await request(app)
    .post(CATEGORIES_ENDPOINT_URL)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);
};

export const createCategory = async (
  cookie: string,
  payload: CreateCategoryPayloadTest
): Promise<CreateCategoryDto> => {
  const res = await request(app)
    .post(CATEGORIES_ENDPOINT_URL)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return res.body;
};

export const fetchCategoryByName = async (cookie: string, name: string) => {
  const { categories } = await getCategories(cookie);

  const category =
    Object.values(categories).find((c) => c.name === name) ?? null;

  if (category === null) {
    throw new Error(`unable to find category: ${name}`);
  }

  return category;
};

export const getTestCategory = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const testCategory =
    Object.values(categories).find((c) => c.name === "test category") ?? null;

  if (testCategory === null) {
    throw new Error("unable to find test category");
  }

  return testCategory;
};

export const getAnotherTestCategory = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const testCategory =
    Object.values(categories).find((c) => c.name === "another test category") ??
    null;

  if (testCategory === null) {
    throw new Error("unable to find another test category");
  }

  return testCategory;
};

export const getCategoryMonths = async (cookie: string, categoryId: string) => {
  const { categories, months } = await getCategories(cookie);

  const category =
    Object.values(categories).find((c) => c.id === categoryId) ?? null;

  if (category === null) {
    throw new Error("unable to find category");
  }

  const categoryMonths = category.months.map((m) => months[m]);

  return categoryMonths;
};

export const getRTACategory = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const rtaCategory =
    Object.values(categories).find((c) => c.name === "Ready to Assign") ?? null;

  if (rtaCategory === null) {
    throw new Error("unable to find rta category");
  }

  return rtaCategory;
};

export const getRtaMonths = async (cookie: string) => {
  const { categories, months } = await getCategories(cookie);

  const rtaCategory =
    Object.values(categories).find((c) => c.name === "Ready to Assign") ?? null;

  if (rtaCategory === null) {
    throw new Error("unable to find rta category");
  }

  const rtaMonths = rtaCategory.months.map((m) => months[m]);

  return rtaMonths;
};

export const getUncategorisedCategory = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const uncategorisedCategory =
    Object.values(categories).find(
      (c) => c.name === "Uncategorised Transactions"
    ) ?? null;

  if (uncategorisedCategory === null) {
    throw new Error("unable to find uncategorised category");
  }

  return uncategorisedCategory;
};
