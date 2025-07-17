import { checkCategoryGroupNameIsUnique } from "./application/service/checkCategoryGroupNameIsUnique";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import { isProtectedCategoryGroup } from "./application/service/isProtectedCategoryGroup";

export const categoryGroupService = {
  ensureUserOwnsCategoryGroup,
  isProtectedCategoryGroup,

  getNextCategoryGroupPosition,
  checkCategoryGroupNameIsUnique,
};
