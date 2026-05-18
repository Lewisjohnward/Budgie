import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useMonthSelector } from "../useMonthSelector";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import { useAllocationEngine } from "./useAllocationEngine";
import { useCategorySelection as useCategorySelector } from "./useCategorySelection";
import { useCategoryBreakdownViewModel } from "./useCategoryBreakdown";
import {
  CategoryGroupId,
  CategoryId,
  CategoryMonthMap,
} from "../../types/types";
import { assembleCategoryGroupViews } from "../../utils/assembleCategoryGroupViews";
import { buildCategoryGroupMetrics } from "../../utils/buildCategoryGroupMetrics";
import { buildCategoryViewModel } from "../../utils/buildCategoryViewModel";
import {
  CategoryGroupBranded,
  CategoryBranded,
} from "@/core/types/NormalizedData";
import { useMonthInitialiser } from "./useMonthInitialiser";
import { useAutoAssignViewModel } from "./useAutoAssign";
import { useNoteViewModel } from "../../components/assign/hooks/useNoteViewModel";

export type RtaInformation = {
  assignableLeftOverFromLastMonth: number;
  assignableCurrentMonth: number;
  totalAssignedCurrentMonth: number;
  totalAssignedFuture: number;
  available: number;
};

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
  const monthSelector = useMonthSelector({ monthKeys: engine.time.monthKeys });

  /*
   * view - category groups
   */
  const { userCategoryGroupViews, rtaRow, uncategorisedRow } =
    buildCategoryGroupViews({
      categoryGroups: engine.entities.categoryGroups,
      categories: engine.entities.categories,
      currentCategoryMonthMap: engine.computed.currentCategoryMonthMap,
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
  console.log("currentRtaMonth:", currentRtaMonth);
  const totalAssignedFuture = 0;
  const available = currentRtaMonth.available;

  /*
   * detailed view
   */
  // TODO:(lewis 2026-05-13 14:40) why are we passing current month name and has selected categories?
  const categoryBreakdownViewModel = useCategoryBreakdownViewModel({
    currentMonthMap: engine.computed.currentCategoryMonthMap,
    previousMonthMap: engine.computed.previousCategoryMonthMap,
    isUncategorisedSelected: engine.selection.isUncategorisedSelected,
    selectedCategoryIds: engine.selection.effectiveIds,
    currentMonthName: monthSelector.currentMonthNameFormatShort,
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
    goToNextOrPreviousMonth: monthSelector.goToNextOrPreviousMonth,
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
   * misc
   */
  //  SIDE EFFECT: reset selection on mount (kept explicit)
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

    monthSelector,
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
};

// Output

export function buildCategoryGroupViews({
  categoryGroups,
  categories,
  currentCategoryMonthMap,
}: UseCategoryGroupViewsParams) {
  const currentUserCategoryMonthMap = useMemo(() => {
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
    });
  }, [categories, categoryGroups, currentCategoryMonthMap]);

  const metrics = useMemo(() => {
    return buildCategoryGroupMetrics({
      categoryGroups: categoryGroups.user,
      categories: categories.user,
      currentUserCategoryMonthMap,
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
