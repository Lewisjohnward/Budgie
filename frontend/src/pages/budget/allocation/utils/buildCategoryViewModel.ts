import {
  CategoryBranded,
  MonthBranded,
  CategoryGroupBranded,
} from "@/core/types/NormalizedData";
import { CategoryId, CategoryGroupId } from "../types/types";

// Input
type BuildCategoryViewModelParams = {
  categories: {
    user: Record<CategoryId, CategoryBranded>;
    rta: CategoryBranded;
    uncategorised: CategoryBranded;
  };
  categoryGroups: {
    user: Record<CategoryGroupId, CategoryGroupBranded>;
    inflow: CategoryGroupBranded;
    uncategorised: CategoryGroupBranded;
  };
  currentCategoryMonthMap: Record<CategoryId, MonthBranded>;
};

// Output
type CategoryViewModel = {
  userCategoryGroupViews: CategoryGroupView[];
  uncategorisedRow: CategoryViewRow;
  rtaRow: CategoryViewRow;
};

export type CategoryViewRow = {
  category: CategoryBranded;
  month: MonthBranded;
};

type CategoryGroupView = {
  group: CategoryGroupBranded;
  rows: CategoryViewRow[];
};

export function buildCategoryViewModel(
  params: BuildCategoryViewModelParams
): CategoryViewModel {
  const { categories, categoryGroups, currentCategoryMonthMap } = params;

  //  Build rows
  const rows: CategoryViewRow[] = Object.values(categories.user)
    .map((category) => buildCategoryViewRow(category, currentCategoryMonthMap))
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
    currentCategoryMonthMap
  );

  // Special row - RTA
  const rtaRow = buildCategoryViewRow(categories.rta, currentCategoryMonthMap);

  return {
    userCategoryGroupViews,
    uncategorisedRow,
    rtaRow,
  };
}

function buildCategoryViewRow(
  category: CategoryBranded,
  map: Record<CategoryId, MonthBranded>
): CategoryViewRow {
  const month = map[category.id];

  if (!month) {
    throw new Error(`Missing month for ${category.id}`);
  }

  return { category, month };
}
