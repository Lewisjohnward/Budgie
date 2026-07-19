import { seedLogin } from "./seeds/auth/login";
import { seedDeleteCategoryBase } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryBase";
import { seedDeleteCategoryWithAssigned } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithAssigned";
import { seedDeleteCategoryWithTransaction } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithTransaction";
import { seedDeleteCategoryGroupBase } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupBase";
import { seedDeleteCategoryGroupWithAssigned } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupWithAssigned";
import { seedDeleteCategoryGroupWithTransaction } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupWithTransaction";
import { seedRenameCategoryGroup } from "./seeds/budget/allocation/categoryGroup/rename/renameCategoryGroup";

export const seeds = {
  login: seedLogin,

  "delete-category-group-base": seedDeleteCategoryGroupBase,
  "delete-category-group-with-assigned": seedDeleteCategoryGroupWithAssigned,
  "delete-category-group-with-transaction":
    seedDeleteCategoryGroupWithTransaction,

  "rename-category-group": seedRenameCategoryGroup,

  "delete-category-base": seedDeleteCategoryBase,
  "delete-category-with-assigned": seedDeleteCategoryWithAssigned,
  "delete-category-with-transaction": seedDeleteCategoryWithTransaction,
} as const;
