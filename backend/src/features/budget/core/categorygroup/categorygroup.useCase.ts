import { createCategoryGroup } from "./application/use-cases/createCategoryGroup";
import { updateCategoryGroup } from "./application/use-cases/updateCategoryGroup";
import { deleteCategoryGroup } from "./application/use-cases/deleteCategoryGroup";
import { getCategoryGroups } from "./application/use-cases/getCategoryGroups";

export const categoryGroupUseCase = {
  getCategoryGroups,
  createCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
};
