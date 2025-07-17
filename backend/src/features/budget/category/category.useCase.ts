import { createCategory } from "./application/use-cases/createCategory";
import { deleteCategory } from "./application/use-cases/deleteCategory";
import { editCategory } from "./application/use-cases/editCategory";
import { selectCategories } from "./application/use-cases/selectCategories";
import {
  CreateCategoryPayload,
  DeleteCategoryPayload,
  EditCategoryPayload,
} from "./category.schema";

export const categoryUseCase = {
  getCategories: (userId: string) => {
    return selectCategories(userId);
  },

  createCategory: (payload: CreateCategoryPayload) => {
    return createCategory(payload);
  },

  editCategory: async (payload: EditCategoryPayload) => {
    return editCategory(payload);
  },

  deleteCategory: async (payload: DeleteCategoryPayload) => {
    return deleteCategory(payload);
  },
};
