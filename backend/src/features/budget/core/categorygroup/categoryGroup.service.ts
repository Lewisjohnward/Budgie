import { checkCategoryGroupNameIsUnique } from "./application/service/checkCategoryGroupNameIsUnique";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getCategoryGroup } from "./application/service/getCategoryGroup";
import { getCategoryGroups } from "./application/service/getCategoryGroups";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import { isProtectedCategoryGroup } from "./application/service/isProtectedCategoryGroup";

export const categoryGroupService = {
  ensureUserOwnsCategoryGroup,
  isProtectedCategoryGroup,

  getNextCategoryGroupPosition,
  checkCategoryGroupNameIsUnique,

  getCategoryGroup,
  getCategoryGroups,
};
