import { createCategoryGroup } from "../category-group/categoryGroup.create";
import { randomUUID } from "node:crypto";
import { createCategory } from "../category/category.create";
import { type TestCategory, type TestCategoryGroup } from "../types/models";

export type CreateGroupWithCategoryResult = {
  categoryGroup: TestCategoryGroup;
  category: TestCategory;
};

/**
 * Creates a category group and a category inside it.
 *
 * This scenario is used when tests require a category
 * without duplicating setup logic.
 */
export async function createGroupWithCategory(
  cookie: string,
  overrides?: {
    groupName?: string;
    categoryName?: string;
  }
): Promise<CreateGroupWithCategoryResult> {
  const suffix = randomUUID();

  const categoryGroup = await createCategoryGroup(cookie, {
    name: overrides?.groupName ?? `test-group-${suffix}`,
  });

  const category = await createCategory(cookie, {
    name: overrides?.categoryName ?? `test-category-${suffix}`,
    categoryGroupId: categoryGroup.id,
  });

  return {
    categoryGroup,
    category,
  };
}
