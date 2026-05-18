import { useMonthIndex } from "../../slices/monthSlice";
import { useAllocationIndexes } from "./useAllocationIndexes";
import { useBudgetSnapshot } from "./useCategories";
import { useSelectedCategories } from "../../slices/selectedCategorySlice";
import {
  CategoryBranded,
  CategoryGroupBranded,
  MonthBranded,
  NoteBranded,
} from "@/core/types/NormalizedData";
import {
  CategoryGroupId,
  CategoryId,
  CategoryMonthMap,
  MonthKey,
} from "../../types/types";

// Output
export type AllocationEngine = {
  entities: {
    categoryGroups: {
      user: Record<CategoryGroupId, CategoryGroupBranded>;
      inflow: CategoryGroupBranded;
      uncategorised: CategoryGroupBranded;
    };
    categories: {
      user: Record<CategoryId, CategoryBranded>;
      rta: CategoryBranded;
      uncategorised: CategoryBranded;
    };
  };

  domain: {
    /*
     *user months
     */
    currentMonths: MonthBranded[];
    /* user months */
    previousMonths: MonthBranded[];
    previousYearMonths: MonthBranded[];
    currentMonthNote: NoteBranded;
  };

  // ⚡ computed
  computed: {
    currentCategoryMonthMap: CategoryMonthMap;
    previousCategoryMonthMap: CategoryMonthMap | null;
  };

  // 📅 time state
  time: {
    monthKeys: MonthKey[];
  };

  selection: {
    categories: CategoryBranded[];

    ids: CategoryId[];

    effectiveIds: CategoryId[];

    count: number;

    isEmpty: boolean;

    isUncategorisedSelected: boolean;
  };
};

export function useAllocationEngine(): AllocationEngine {
  const { data } = useBudgetSnapshot();
  const monthIndex = useMonthIndex();
  const selectedCategories = useSelectedCategories();

  // 🔹 1. Indexing
  const indexes = useAllocationIndexes({
    months: data.months,
    monthKeys: data.monthKeys,
    monthIndex: monthIndex,
    userCategories: data.categories.user,
  });

  /*
   * Get current month note
   */
  const currentMonthKey = data.monthKeys[monthIndex];
  const currentMonthNote = data.notesByMonth[currentMonthKey];

  /*
   * selected categories
   */
  const selectedCategoryIds = selectedCategories.map((c) => c.id);
  const selectedCategorySet = new Set(selectedCategoryIds);

  const isUncategorisedSelected = selectedCategorySet.has(
    data.categories.uncategorised.id
  );

  const effectiveCategoryIds =
    selectedCategoryIds.length === 0
      ? [
          ...Object.values(data.categories.user).map((c) => c.id),
          data.categories.uncategorised.id,
        ]
      : selectedCategoryIds;

  const uncategorisedId = data.categories.uncategorised.id;

  const selectedCategoriesForDisplay =
    selectedCategories.length === 1
      ? selectedCategories
      : selectedCategories.filter((c) => c.id !== uncategorisedId);

  return {
    entities: {
      categoryGroups: data.categoryGroups,
      categories: data.categories,
    },

    domain: {
      currentMonths: indexes.currentUserMonths,
      previousMonths: indexes.previousUserMonths,
      previousYearMonths: indexes.previousYearUserMonths,
      currentMonthNote: currentMonthNote,
    },

    // 📊 view
    computed: {
      currentCategoryMonthMap: indexes.currentCategoryMonthMap,
      previousCategoryMonthMap: indexes.previousCategoryMonthMap,
    },

    time: {
      monthKeys: data.monthKeys,
    },

    selection: {
      categories: selectedCategoriesForDisplay,
      // all selected category ids
      ids: selectedCategoryIds,
      // if no selection return all categories, otherwise return selected categories
      effectiveIds: effectiveCategoryIds,
      count: selectedCategoryIds.length,
      isEmpty: selectedCategoryIds.length === 0,
      isUncategorisedSelected,
    },
  };
}
