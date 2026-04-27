import { PROTECTED_CATEGORY_GROUP_NAMES } from "../categoryGroup.constants";
import { DomainCategoryGroup } from "../categoryGroup.types";

type SystemCategoryGroupKey = "INFLOW" | "UNCATEGORISED";

export type ExtractedCategoryGroups = {
  system: Record<SystemCategoryGroupKey, DomainCategoryGroup>;
  user: DomainCategoryGroup[];
};

export function extractSystemCategoryGroups(
  categoryGroups: DomainCategoryGroup[]
): ExtractedCategoryGroups {
  const system: Partial<Record<SystemCategoryGroupKey, DomainCategoryGroup>> =
    {};
  const user: DomainCategoryGroup[] = [];

  for (const group of categoryGroups) {
    if (group.name === PROTECTED_CATEGORY_GROUP_NAMES[0]) {
      system.INFLOW = group;
    } else if (group.name === PROTECTED_CATEGORY_GROUP_NAMES[1]) {
      system.UNCATEGORISED = group;
    } else {
      user.push(group);
    }
  }

  if (!system.INFLOW) {
    throw new Error("Missing system category group: INFLOW");
  }

  if (!system.UNCATEGORISED) {
    throw new Error("Missing system category group: UNCATEGORISED");
  }

  return {
    system: {
      INFLOW: system.INFLOW,
      UNCATEGORISED: system.UNCATEGORISED,
    },
    user,
  };
}
