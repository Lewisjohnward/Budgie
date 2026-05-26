import { createCategoryGroup } from "./application/service/createCategoryGroup";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getUserCategoryGroup } from "./application/service/getCategoryGroup";
import { getCategoryGroups } from "./application/service/getCategoryGroups";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import {
  getModifiableCategoryGroup,
  isProtectedCategoryGroup,
} from "./application/service/isProtectedCategoryGroup";
import { renameCategoryGroup } from "./application/service/renameCategoryGroup";
import { repositionCategoryGroup } from "./application/service/repositionCategoryGroup";

export const categoryGroupService = {
  ensureUserOwnsCategoryGroup,
  isProtectedCategoryGroup,
  getModifiableCategoryGroup,

  getNextCategoryGroupPosition,
  createCategoryGroup,

  renameCategoryGroup,
  repositionCategoryGroup,
  getUserCategoryGroup,
  getCategoryGroups,
};
