import { getCategories } from "./getData";

export const getTestCategory = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const testCategory =
    Object.values(categories).find((c) => c.name === "test category") ?? null;

  if (testCategory === null) {
    throw new Error("unable to find test category");
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
