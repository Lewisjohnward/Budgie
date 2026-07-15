import { seedLogin } from "./seeds/auth/login";
import { seedDeleteCategoryBase } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryBase";
import { seedDeleteCategoryWithAssigned } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithAssigned";
import { seedDeleteCategoryWithTransaction } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithTransaction";

export const scenarios = {
  login: seedLogin,
  "delete-category-base": seedDeleteCategoryBase,
  "delete-category-with-assigned": seedDeleteCategoryWithAssigned,
  "delete-category-with-transaction": seedDeleteCategoryWithTransaction,
} as const;
