import { createCategoryGroup } from "../category-group/categoryGroup.create";

/**
 * Creates a set of test category groups for use in integration tests.
 */
export const createTestCategoryGroups = async (cookie: string) => {
  const [a, b, c] = await Promise.all([
    createCategoryGroup(cookie, { name: "A" }),
    createCategoryGroup(cookie, { name: "B" }),
    createCategoryGroup(cookie, { name: "C" }),
  ]);

  return [a, b, c];
};
