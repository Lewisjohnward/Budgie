import { createCategory } from "./application/use-cases/createCategory";
import { deleteCategory } from "./application/use-cases/deleteCategory";
import { editCategory } from "./application/use-cases/editCategory";
import { selectCategories } from "./application/use-cases/selectCategories";

export const categoryUseCase = {
  getCategories: selectCategories,

  createCategory,
  editCategory,
  deleteCategory,
};
