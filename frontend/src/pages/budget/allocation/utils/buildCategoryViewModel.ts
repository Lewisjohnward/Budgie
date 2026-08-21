import {
  CategoryUserBranded,
  MonthBranded,
  CategoryGroupUserBranded,
  CategorySystemBranded,
  CategoryGroupSystemBranded,
} from "@/core/types/NormalizedData";
import { CategoryId, CategoryGroupId } from "../types/types";
import { CategoryMetricsById } from "../hooks/useAllocation/useAllocationIndexes";

// Input
type BuildCategoryViewModelParams = {
  categories: {
    user: Record<CategoryId, CategoryUserBranded>;
    rta: CategorySystemBranded;
    uncategorised: CategorySystemBranded;
  };
  categoryGroups: {
    user: Record<CategoryGroupId, CategoryGroupUserBranded>;
    inflow: CategoryGroupSystemBranded;
    uncategorised: CategoryGroupSystemBranded;
  };
  currentCategoryMonthMap: Record<CategoryId, MonthBranded>;
  categoryMetricsById: CategoryMetricsById;
};

// Output
type CategoryViewModel = {
  userCategoryGroupViews: CategoryGroupView[];
  uncategorisedRow: CategoryViewRow<CategorySystemBranded>;
  rtaRow: CategoryViewRow<CategorySystemBranded>;
};

export type CategoryViewRow<TCategory> = {
  category: TCategory;
  transactionCount: number;
  hasAssigned: boolean;
  month: MonthBranded;
};

type CategoryGroupView = {
  group: CategoryGroupUserBranded;
  rows: CategoryViewRow<CategoryUserBranded>[];
};

export function buildCategoryViewModel({
  categories,
  categoryGroups,
  currentCategoryMonthMap,
  categoryMetricsById,
}: BuildCategoryViewModelParams): CategoryViewModel {
  //  Build rows
  const rows: CategoryViewRow[] = Object.values(categories.user)
    .map((category) =>
      buildCategoryViewRow(
        category,
        currentCategoryMonthMap,
        categoryMetricsById
      )
    )
    // Sort based on position
    .sort((a, b) => a.category.position - b.category.position);

  // Group rows
  const rowsByGroup: Record<CategoryGroupId, CategoryViewRow[]> = {};

  for (const row of rows) {
    const groupId = row.category.categoryGroupId;
    if (!categoryGroups.user[groupId]) {
      throw new Error(
        `Non-user category passed to user view model: ${row.category.id}`
      );
    }
    (rowsByGroup[groupId] ??= []).push(row);
  }

  const userCategoryGroupViews: CategoryGroupView[] = Object.values(
    categoryGroups.user
  )
    // Sort category group on position
    .sort((a, b) => a.position - b.position)
    .map((group) => ({
      group,
      rows: rowsByGroup[group.id] ?? [],
    }));

  // Special row - uncategorised
  const uncategorisedRow = buildCategoryViewRow(
    categories.uncategorised,
    currentCategoryMonthMap,
    categoryMetricsById
  );

  // Special row - RTA
  const rtaRow = buildCategoryViewRow(
    categories.rta,
    currentCategoryMonthMap,
    categoryMetricsById
  );

  return {
    userCategoryGroupViews,
    uncategorisedRow,
    rtaRow,
  };
}

function buildCategoryViewRow<
  TCategory extends CategoryUserBranded | CategorySystemBranded,
>(
  category: TCategory,
  map: Record<CategoryId, MonthBranded>,
  categoryMetricsById: CategoryMetricsById
): CategoryViewRow<TCategory> {
  const month = map[category.id];

  if (!month) {
    throw new Error(`Missing month for ${category.id}`);
  }

  const metrics = categoryMetricsById[category.id];

  return {
    category,
    month,
    transactionCount: metrics?.transactionCount ?? 0,
    hasAssigned: metrics?.hasAssigned ?? false,
  };
}
