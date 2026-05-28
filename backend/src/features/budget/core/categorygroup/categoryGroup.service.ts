import { createCategoryGroup } from "./application/service/createCategoryGroup";
import { deleteCategoryGroup } from "./application/service/deleteCategoryGroup";
import { ensureUserOwnsCategoryGroup } from "./application/service/ensureUserOwnsCategoryGroup";
import { getUserCategoryGroup } from "./application/service/getCategoryGroup";
import { getCategoryGroups } from "./application/service/getCategoryGroups";
import { getModifiableCategoryGroup } from "./application/service/getModifiableCategoryGroup";
import { getNextCategoryGroupPosition } from "./application/service/getNextCategoryGroupPosition";
import { isProtectedCategoryGroup } from "./application/service/isProtectedCategoryGroup";
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
  // TODO:(lewis 2026-05-27 11:58) is this used?
  getUserCategoryGroup,
  getCategoryGroups,
  deleteCategoryGroup,
};
