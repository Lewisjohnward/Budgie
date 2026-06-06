import { createCategory } from "./application/use-cases/createCategory";
import { deleteCategory } from "./application/use-cases/deleteCategory";
import { updateCategory } from "./application/use-cases/updateCategory";
import { selectCategories } from "./application/use-cases/selectCategories";

export const categoryUseCase = {
  getCategories: selectCategories,

  createCategory,
  updateCategory,
  deleteCategory,
};
