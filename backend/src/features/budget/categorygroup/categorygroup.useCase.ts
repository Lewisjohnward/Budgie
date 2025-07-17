import { createCategoryGroup } from "./application/use-cases/createCategoryGroup";
import { editCategoryGroup } from "./application/use-cases/editCategoryGroup";
import { deleteCategoryGroup } from "./application/use-cases/deleteCategoryGroup";

export const categoryGroupUseCase = {
  createCategoryGroup,
  editCategoryGroup,
  deleteCategoryGroup,
};
