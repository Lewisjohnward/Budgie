import {
  type DomainUserCategoryGroup,
  type DomainSystemCategoryGroup,
  type CategoryGroupsMap,
} from "../categoryGroup.types";

// TODO:(lewis 2026-05-22 04:29) needs a jsdoc
export const normaliseCategoryGroups = (groups: {
  user: DomainUserCategoryGroup[];
  system: DomainSystemCategoryGroup[];
}): CategoryGroupsMap => {
  return {
    user: groups.user.reduce(
      (acc, g) => {
        acc[g.id] = g;
        return acc;
      },
      {} as Record<string, DomainUserCategoryGroup>
    ),

    system: groups.system.reduce(
      (acc, g) => {
        acc[g.id] = g;
        return acc;
      },
      {} as Record<string, DomainSystemCategoryGroup>
    ),
  };
};
