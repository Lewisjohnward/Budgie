import { seedLogin } from "../../e2e/seeds/auth/login";
import { seedDeleteCategoryBase } from "../../e2e/seeds/budget/allocation/category/delete/seedDeleteCategoryBase";
import { seedDeleteCategoryWithAssigned } from "../../e2e/seeds/budget/allocation/category/delete/seedDeleteCategoryWithAssigned";
import { seedDeleteCategoryWithTransaction } from "../../e2e/seeds/budget/allocation/category/delete/seedDeleteCategoryWithTransaction";

export const scenarios = {
  login: seedLogin,
  "delete-category-base": seedDeleteCategoryBase,
  "delete-category-with-assigned": seedDeleteCategoryWithAssigned,
  "delete-category-with-transaction": seedDeleteCategoryWithTransaction,
} as const;
