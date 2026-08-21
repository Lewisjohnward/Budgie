import {
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

type CategoryPositionPatch = {
  id: CategoryId;
  position: number;
  categoryGroupId: CategoryGroupId;
};

// Create
export type CreateCategoryInput = {
  name: string;
  categoryGroupId: CategoryGroupId;
};

export type CreateCategoryResult = {
  created: {
    category: CategoryUserBranded;
    months: Record<MonthId, MonthBranded>;
  };
};

// Update
export type UpdateCategoryInput = {
  categoryId: CategoryId;
  name?: string;
  categoryGroupId?: CategoryGroupId;
  position?: number;
};

export type UpdateCategoryResult = {
  updated: {
    category: CategoryUserBranded;
    categories: CategoryPositionPatch[];
  };
};

// Delete
export type DeleteCategoryInput = {
  categoryId: CategoryId;
  inheritingCategoryId?: CategoryId;
};

export type DeleteCategoryResult = {
  deleted: {
    category: CategoryUserBranded;
    months: Record<MonthId, MonthBranded>;
  };
  updated: {
    categories: CategoryPositionPatch[];
    transactions: Record<TransactionId, TransactionBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};
