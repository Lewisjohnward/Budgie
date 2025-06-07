import { Prisma } from "@prisma/client";
import { createCategory } from "./use-cases/createCategory";
import { deleteCategoryById } from "./use-cases/deleteCategoryById";
import { initialiseCategories } from "./use-cases/initialiseCategories";
import { isValidCategory } from "./use-cases/isValidCategory";
import { selectCategories } from "./use-cases/selectCategories";
import { updateCategoryById } from "./use-cases/updateCategoryById";
import { CategoryPayload, UpdateCategoryPayload } from "./category.schema";
import { getRtaCategory } from "./use-cases/getRtaCategory";
import { getUncategorisedCategory } from "./use-cases/getUncategorisedCategory";

export const categoryService = {
  getCategories: (userId: string) => {
    return selectCategories(userId);
  },

  createCategory: (payload: CategoryPayload) => {
    return createCategory(payload);
  },

  updateCategory: async (
    userId: string,
    categoryId: string,
    payload: UpdateCategoryPayload,
  ) => {
    const isOwner = await isValidCategory(userId, categoryId);
    if (!isOwner) {
      throw new Error("User does not have permission to update this category.");
    }
    return updateCategoryById();
  },

  deleteCategory: async (userId: string, categoryId: string) => {
    const isOwner = await isValidCategory(userId, categoryId);
    if (!isOwner) {
      throw new Error("User does not have permission to delete this category.");
    }
    return deleteCategoryById({ userId, categoryToDeleteId: categoryId });
  },

  initialiseUserCategories: (userId: string) => {
    return initialiseCategories(userId);
  },

  getRtaCategory: (tx: Prisma.TransactionClient, userId: string) => {
    return getRtaCategory(tx, userId);
  },

  getUncategorisedCategory: (tx: Prisma.TransactionClient, userId: string) => {
    return getUncategorisedCategory(tx, userId);
  },
};
