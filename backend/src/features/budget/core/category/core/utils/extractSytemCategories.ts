import { PROTECTED_CATEGORY_NAMES } from "../category.constants";
import { DomainCategory } from "../category.types";

type SystemCategoryKey = "RTA" | "UNCATEGORISED";

export type ExtractedCategories = {
  system: Record<SystemCategoryKey, DomainCategory>;
  user: DomainCategory[];
};

export function extractSystemCategories(
  categories: DomainCategory[]
): ExtractedCategories {
  const system: Partial<Record<SystemCategoryKey, DomainCategory>> = {};
  const user: DomainCategory[] = [];

  for (const category of categories) {
    if (category.name === PROTECTED_CATEGORY_NAMES[0]) {
      system.RTA = category;
    } else if (category.name === PROTECTED_CATEGORY_NAMES[1]) {
      system.UNCATEGORISED = category;
    } else {
      user.push(category);
    }
  }

  if (!system.RTA) {
    throw new Error("Missing system category: RTA");
  }

  if (!system.UNCATEGORISED) {
    throw new Error("Missing system category: UNCATEGORISED");
  }

  return {
    system: {
      RTA: system.RTA,
      UNCATEGORISED: system.UNCATEGORISED,
    },
    user,
  };
}
