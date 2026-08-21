import {
  CategoryGroupUserBranded,
  CategoryUserBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import {
  CategoryGroupId,
  CategoryId,
  MonthId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";

type CategoryGroupPositionPatch = {
  id: CategoryGroupId;
  position: number;
};

// Create
export type CreateCategoryGroupInput = {
  name: string;
};

export type CreateCategoryGroupResult = {
  created: {
    categoryGroup: CategoryGroupUserBranded;
  };
};

// Update
export type UpdateCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  name?: string;
  position?: number;
};

export type UpdateCategoryGroupResult = {
  updated: {
    categoryGroup: CategoryGroupUserBranded;
    categoryGroups: CategoryGroupPositionPatch[];
  };
};

// Delete
export type DeleteCategoryGroupInput = {
  categoryGroupId: CategoryGroupId;
  inheritingCategoryId?: CategoryId;
};

export type DeleteCategoryGroupResult = {
  deleted: {
    categoryGroup: CategoryGroupUserBranded;
    categories: Record<CategoryId, CategoryUserBranded>;
    months: Record<MonthId, MonthBranded>;
  };
  updated: {
    categoryGroups: CategoryGroupPositionPatch[];
    transactions: Record<TransactionId, TransactionBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};
