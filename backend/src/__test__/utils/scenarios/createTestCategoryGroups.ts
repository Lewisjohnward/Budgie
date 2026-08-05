import { createCategoryGroup } from "../category-group/categoryGroup.create";

/**
 * Creates a set of test category groups for use in integration tests.
 */
export const createTestCategoryGroups = async (cookie: string) => {
  const a = await createCategoryGroup(cookie, { name: "A" });
  const b = await createCategoryGroup(cookie, { name: "B" });
  const c = await createCategoryGroup(cookie, { name: "C" });

  return [a, b, c];
};
