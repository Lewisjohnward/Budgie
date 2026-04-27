import { createCategoryGroup } from "./application/use-cases/createCategoryGroup";
import { editCategoryGroup } from "./application/use-cases/editCategoryGroup";
import { deleteCategoryGroup } from "./application/use-cases/deleteCategoryGroup";
import { getCategoryGroups } from "./application/use-cases/getCategoryGroups";

export const categoryGroupUseCase = {
  getCategoryGroups,
  createCategoryGroup,
  editCategoryGroup,
  deleteCategoryGroup,
};
