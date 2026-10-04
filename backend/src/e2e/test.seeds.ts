import { seedDemo } from "../demo/application/services/seed";
import { seedLogin } from "./seeds/auth/login";
import { seedDeleteCategoryBase } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryBase";
import { seedDeleteCategoryWithAssigned } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithAssigned";
import { seedDeleteCategoryWithTransaction } from "./seeds/budget/allocation/category/delete/seedDeleteCategoryWithTransaction";
import { seedReorderCategory } from "./seeds/budget/allocation/category/reorder/reorderCategory";
import { seedReorderCategoryWithinGroup } from "./seeds/budget/allocation/category/reorder/reorderCategoryWithinGroup";
import { seedDeleteCategoryGroupBase } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupBase";
import { seedDeleteCategoryGroupWithAssigned } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupWithAssigned";
import { seedDeleteCategoryGroupWithTransaction } from "./seeds/budget/allocation/categoryGroup/delete/seedDeleteCategoryGroupWithTransaction";
import { seedRenameCategoryGroup } from "./seeds/budget/allocation/categoryGroup/rename/renameCategoryGroup";
import { seedReorderCategoryGroups } from "./seeds/budget/allocation/categoryGroup/reorder/reorderCategoryGroups";
import { seedUpdateMemoBase } from "./seeds/budget/allocation/memo/update/seedUpdateMemoBase";

export const seeds = {
  login: seedLogin,

  "update-memo-base": seedUpdateMemoBase,
  "delete-category-group-base": seedDeleteCategoryGroupBase,
  "delete-category-group-with-assigned": seedDeleteCategoryGroupWithAssigned,
  "delete-category-group-with-transaction":
    seedDeleteCategoryGroupWithTransaction,

  "rename-category-group": seedRenameCategoryGroup,

  "delete-category-base": seedDeleteCategoryBase,
  "delete-category-with-assigned": seedDeleteCategoryWithAssigned,
  "delete-category-with-transaction": seedDeleteCategoryWithTransaction,
  "reorder-category-within-group": seedReorderCategoryWithinGroup,
  "reorder-category": seedReorderCategory,
  "reorder-category-groups": seedReorderCategoryGroups,
  demo: seedDemo,
} as const;
