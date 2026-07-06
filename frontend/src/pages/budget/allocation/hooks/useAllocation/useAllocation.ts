import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useMonthSelectorViewModel } from "../useMonthSelector";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import { useAllocationEngine } from "./useAllocationEngine";
import { useCategorySelection as useCategorySelector } from "./useCategorySelection";
import { useCategoryBreakdownViewModel } from "./useCategoryBreakdown";
import {
  CategoryGroupId,
  CategoryId,
  CategoryMonthMap,
  MonthId,
} from "../../types/types";
import {
  assembleCategoryGroupViews,
  CategoryGroupViewWithMetrics,
} from "../../utils/assembleCategoryGroupViews";
import { buildCategoryGroupMetrics } from "../../utils/buildCategoryGroupMetrics";
import {
  buildCategoryViewModel,
  CategoryViewRow,
} from "../../utils/buildCategoryViewModel";
import {
  CategoryGroupBranded,
  CategoryBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import { useMonthInitialiser } from "./useMonthInitialiser";
import { useAutoAssignViewModel } from "./useAutoAssign";
import { useNoteViewModel } from "../../components/assign/hooks/useNoteViewModel";
import { CategoryMetricsById } from "./useAllocationIndexes";
import { getCategoryDeleteState as resolveCategoryDeleteState } from "../../utils/getCategoryDeleteState";
import { getCategoryGroupDeleteState as resolveCategoryGroupDeleteState } from "../../utils/getCategoryGroupDeleteState";

export type RtaInformation = {
  assignableLeftOverFromLastMonth: number;
  assignableCurrentMonth: number;
  totalAssignedCurrentMonth: number;
  totalAssignedFuture: number;
  available: number;
};

export type ExcludeTarget =
  | { type: "categoryGroup"; id: CategoryGroupId }
  | { type: "category"; id: CategoryId };

export type CategorySelectOptions = {
  id: CategoryGroupId;
  name: string;
  categories: {
    id: CategoryId;
    name: string;
    available: number;
  }[];
}[];

export function useAllocation() {
  const dispatch = useAppDispatch();

  /*
   * engine
   */
  const engine = useAllocationEngine();

  /*
   * initialse months (set most recent month as current month)
   */
  useMonthInitialiser({ monthKeys: engine.time.monthKeys });

  /*
   * month selector
   */
  const monthSelectorViewModel = useMonthSelectorViewModel({
    monthKeys: engine.time.monthKeys,
  });

  /*
   * view - category groups
   */
  const { userCategoryGroupViews, rtaRow, uncategorisedRow } =
    buildCategoryGroupViews({
      categoryGroups: engine.entities.categoryGroups,
      categories: engine.entities.categories,
      currentCategoryMonthMap: engine.computed.currentCategoryMonthMap,
      categoryMetricsById: engine.computed.categoryMetricsById,
    });

  const expandCategoryGroups = useExpandableCategoryGroups({
    categoryGroups: userCategoryGroupViews,
  });

  /*
   * notes
   */
  const noteViewModel = useNoteViewModel({
    note: engine.domain.currentMonthNote,
  });

  /*
   * Ready to assign
   */

  // Get RTA
  const rtaId = engine.entities.categories.rta.id;
  const currentRtaMonth = engine.computed.currentCategoryMonthMap[rtaId];
  const previousRtaMonth = engine.computed?.previousCategoryMonthMap?.[rtaId];

  const totalAssignedCurrentMonth = engine.domain.currentMonths.reduce(
    (acc, current) => {
      const val = (acc * 100 + current.assigned * 100) / 100;
      return val;
    },
    0
  );

  const assignableLeftOverFromLastMonth = 0;
  const assignableCurrentMonth = currentRtaMonth.activity;
  const totalAssignedFuture = 0;
  const available = currentRtaMonth.available;

  /*
   * detailed view
   */
  const categoryBreakdownViewModel = useCategoryBreakdownViewModel({
    currentMonthMap: engine.computed.currentCategoryMonthMap,
    previousMonthMap: engine.computed.previousCategoryMonthMap,
    isUncategorisedSelected: engine.selection.isUncategorisedSelected,
    selectedCategoryIds: engine.selection.effectiveIds,
    currentMonthName: monthSelectorViewModel.current.labelShort,
    hasSelectedCategories: !engine.selection.isEmpty,
  });

  /*
   * autoassign
   */
  const autoAssignViewModel = useAutoAssignViewModel({
    categories: engine.entities.categories.user,
    categoryGroups: engine.entities.categoryGroups.user,
    isUncategorisedSelected: engine.selection.isUncategorisedSelected,
    currentMonths: engine.domain.currentMonths,
    previousMonths: engine.domain.previousMonths,
    previousYearMonths: engine.domain.previousYearMonths,
    rtaAvailable: rtaRow.month.available,
    selectedCategoryIds: engine.selection.ids,
    autoAccept: !engine.selection.isEmpty,
    goToNextOrPreviousMonth:
      monthSelectorViewModel.navigation.goToNextOrPrevious,
  });

  /*
   * category selection
   */

  // TODO:(lewis 2026-05-15 15:13) this should not be coming from views
  const orderedCategories = userCategoryGroupViews.flatMap(({ rows }) =>
    rows.map((row) => row.category)
  );

  // TODO:(lewis 2026-05-15 15:13) this should not be coming from views
  const categorySelector = useCategorySelector({
    orderedCategories: [...orderedCategories, uncategorisedRow.category],
  });

  useEffect(() => {
    // Pressing escape clears category selection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        categorySelector.clear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /*
   * category/category group deletion
   */

  const categoryIdsByGroupId = useMemo(() => {
    const result: Record<CategoryGroupId, CategoryId[]> = {};

    for (const category of Object.values(engine.entities.categories.user)) {
      (result[category.categoryGroupId] ??= []).push(category.id);
    }

    return result;
  }, [engine.entities.categories.user]);

  const getCategoryDeleteState = useCallback(
    (categoryId: CategoryId) =>
      resolveCategoryDeleteState({
        categoryId,
        metrics: engine.computed.categoryMetricsById,
      }),
    [engine.computed.categoryMetricsById]
  );

  const getCategoryGroupDeleteState = useCallback(
    (categoryGroupId: CategoryGroupId) =>
      resolveCategoryGroupDeleteState({
        categoryGroupId,
        categoryIdsInGroup: categoryIdsByGroupId[categoryGroupId] ?? [],
        metrics: engine.computed.categoryMetricsById,
      }),
    [engine.computed.categoryMetricsById]
  );

  /**
   * Builds the category selector data grouped by category group.
   * Optionally excludes a category or category group from the returned options.
   * Used when selecting a destination category for reassignment.
   */
  const getCategorySelectOptions = useCallback(
    (exclude?: ExcludeTarget): CategorySelectOptions => {
      const groups = Object.values(engine.entities.categoryGroups.user);

      return groups
        .filter((g) => {
          if (!exclude) return true;

          if (exclude.type === "categoryGroup") {
            return g.id !== exclude.id;
          }

          return true;
        })
        .map((group) => ({
          id: group.id,
          name: group.name,
          categories: (categoryIdsByGroupId[group.id] ?? [])
            .filter((id) => {
              if (!exclude || exclude.type === "categoryGroup") return true;
              if (exclude.type === "category") return id !== exclude.id;
              return true;
            })
            .map((id) => {
              const cat = engine.entities.categories.user[id];
              const m = engine.computed.currentCategoryMonthMap[id];

              return {
                id,
                name: cat.name,
                available: m.available,
              };
            }),
        }));
    },
    [
      engine.entities.categoryGroups.user,
      engine.entities.categories.user,
      engine.computed.currentCategoryMonthMap,
      categoryIdsByGroupId,
    ]
  );

  /*
   * misc
   */
  //  SIDE EFFECT: reset category selection on mount (kept explicit)
  useEffect(() => {
    categorySelector.clear();
    // TODO:(lewis 2026-05-07 08:42) is this dependence correct?
  }, [dispatch]);

  // 4. CONSTANTS (UI config only)
  const currency = "£";

  // 5. HEADER STATE (pure composition)
  const categoriesSelector = [
    "All",
    "Underfunded",
    "Money available",
    "Snoozed",
  ];

  /*
   *  return
   */
  return {
    currency,
    categorySelector,
    view: {
      // Data for displaying uncategorisedRow
      uncategorisedRow,
      // Data for displaying the category groups -> categories
      categoriesByGroup: expandCategoryGroups.categoryGroups,
    },
    expandCategoryGroups,

    rtaInformation: {
      assignableLeftOverFromLastMonth,
      assignableCurrentMonth,
      totalAssignedCurrentMonth,
      totalAssignedFuture,
      available,
    },

    deleteState: {
      getCategoryDeleteState,
      getCategoryGroupDeleteState,
    },

    selectors: {
      getCategorySelectOptions,
    },

    monthSelectorViewModel,
    categoriesSelector,

    selectedCategories: engine.selection.categories,

    categoryBreakdownViewModel,
    autoAssignViewModel,
    noteViewModel,
  };
}

// Input
type UseCategoryGroupViewsParams = {
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
  currentCategoryMonthMap: CategoryMonthMap;
  categoryMetricsById: CategoryMetricsById;
};

// Output
type CategoryGroupViews = {
  userCategoryGroupViews: CategoryGroupViewWithMetrics[];
  uncategorisedRow: CategoryViewRow;
  rtaRow: CategoryViewRow;
};

export function buildCategoryGroupViews({
  categoryGroups,
  categories,
  currentCategoryMonthMap,
  categoryMetricsById,
}: UseCategoryGroupViewsParams): CategoryGroupViews {
  const currentUserCategoryMonthMap: Record<MonthId, MonthBranded> =
    useMemo(() => {
      return Object.fromEntries(
        Object.entries(currentCategoryMonthMap).filter(
          ([categoryId]) => categoryId in categories.user
        )
      );
    }, [currentCategoryMonthMap, categories.user]);

  const viewModel = useMemo(() => {
    return buildCategoryViewModel({
      categories,
      categoryGroups,
      currentCategoryMonthMap,
      categoryMetricsById,
    });
  }, [categories, categoryGroups, currentCategoryMonthMap]);

  const metrics = useMemo(() => {
    return buildCategoryGroupMetrics({
      categoryGroups: categoryGroups.user,
      categories: categories.user,
      currentUserCategoryMonthMap,
      categoryMetricsById,
    });
  }, [categoryGroups, categories, currentUserCategoryMonthMap]);

  const assembledViews = useMemo(() => {
    return assembleCategoryGroupViews({
      categoryGroupViews: viewModel.userCategoryGroupViews,

      categoryGroupMetrics: metrics,
    });
  }, [viewModel.userCategoryGroupViews, metrics]);

  return {
    userCategoryGroupViews: assembledViews,
    uncategorisedRow: viewModel.uncategorisedRow,
    rtaRow: viewModel.rtaRow,
  };
}
