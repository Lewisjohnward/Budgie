import { checkCategoryGroupNameIsUnique } from "./application/service/checkCategoryGroupNameIsUnique";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getCategoryGroup } from "./application/service/getCategoryGroup";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import { isProtectedCategoryGroup } from "./application/service/isProtectedCategoryGroup";

export const categoryGroupService = {
  ensureUserOwnsCategoryGroup,
  isProtectedCategoryGroup,

  getNextCategoryGroupPosition,
  checkCategoryGroupNameIsUnique,

  getCategoryGroup,
};
