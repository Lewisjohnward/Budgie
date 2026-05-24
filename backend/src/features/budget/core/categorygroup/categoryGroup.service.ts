import { checkCategoryGroupNameIsUnique } from "./application/service/checkCategoryGroupNameIsUnique";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getUserCategoryGroup } from "./application/service/getCategoryGroup";
import { getCategoryGroups } from "./application/service/getCategoryGroups";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import { isProtectedCategoryGroup } from "./application/service/isProtectedCategoryGroup";
import { repositionCategoryGroup } from "./application/service/repositionCategoryGroup";

export const categoryGroupService = {
  ensureUserOwnsCategoryGroup,
  isProtectedCategoryGroup,

  getNextCategoryGroupPosition,
  checkCategoryGroupNameIsUnique,

  repositionCategoryGroup,

  getUserCategoryGroup,
  getCategoryGroups,
};
