import { createCategory } from "./application/use-cases/createCategory";
import { deleteCategory } from "./application/use-cases/deleteCategory";
import { selectCategories } from "./application/use-cases/selectCategories";
import { updateCategory } from "./application/use-cases/updateCategory";
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

  updateCategory: async (payload: EditCategoryPayload) => {
    return updateCategory(payload);
  },

  deleteCategory: async (payload: DeleteCategoryPayload) => {
    return deleteCategory(payload);
  },
};
