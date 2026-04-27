import { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/core/hooks/reduxHooks";
import { useMonthSelector } from "../useMonthSelector";
import { useExpandableCategoryGroups } from "./useExpandableCategoryGroups";
import {
  useAutoAssignModal,
  useNotes,
  useToggle,
  useUpdateMonths,
} from "../../components/assign/hooks";
import { FundingOption } from "../../components/assign/types/assignTypes";
import { useAllocationEngine } from "./useAllocationEngine";
import { useAutoAssignEngine } from "./useAutoAssignEngine";
import { useCategorySelection as useCategorySelector } from "./useCategorySelection";
import { useCategoryBreakdown } from "./useCategoryBreakdown";
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

export function useAllocation() {
  const dispatch = useAppDispatch();

  /*
   * engine
   */
  const engine = useAllocationEngine();

  /*
   * initialse months (set most recent month as current month)
   */
  useMonthInitialiser(engine.time.monthKeys);

  /*
   * month selector
   */
  const monthSelector = useMonthSelector(engine.time.monthKeys);

  /*
   * view - category groups
   */
  const { userCategoryGroupViews, rtaRow, uncategorisedRow } =
    useCategoryGroupViews({
      categoryGroups: engine.entities.categoryGroups,
      categories: engine.entities.categories,
      currentCategoryMonthMap: engine.computed.currentCategoryMonthMap,
    });

  const expandCategoryGroups = useExpandableCategoryGroups(
    userCategoryGroupViews
  );

  /*
   * notes
   */
  const notesUi = useToggle();
  const note = useNotes({
    note: engine.domain.currentMonthNote,
  });

  /*
   * detailed view
   */
  // TODO:(lewis 2026-05-13 14:40) why are we passing current month name and has selected categories?
  const categoryBreakdown = useCategoryBreakdown({
    currentMonthMap: engine.computed.currentCategoryMonthMap,
    previousMonthMap: engine.computed.previousCategoryMonthMap,
    selectedCategoryIds: engine.selection.effectiveIds,
    currentMonthName: monthSelector.currentMonthNameFormatShort,
    hasSelectedCategories: !engine.selection.isEmpty,
  });

  /*
   * autoassign
   */
  const autoAssignUi = useToggle(true);

  const { updateMonths } = useUpdateMonths();

  const handleNextMonth = () =>
    monthSelector.canGoNext ? monthSelector.next() : monthSelector.prev();

  const autoAssignModal = useAutoAssignModal({
    onConfirm: updateMonths,
    continueToNextMonth: handleNextMonth,
  });

  const autoAssign = useAutoAssignEngine({
    categories: engine.entities.categories.user,
    categoryGroups: engine.entities.categoryGroups.user,
    currentMonths: engine.domain.currentMonths,
    previousMonths: engine.domain.previousMonths,
    previousYearMonths: engine.domain.previousYearMonths,
    rtaAvailable: rtaRow.month.available,
    selectedCategoryIds: engine.selection.ids,
    autoAccept: !engine.selection.isEmpty,
    modal: {
      open: autoAssignModal.open,
    },
    updateMonths,
  });

  const underfundedAmount = autoAssign.assignAmount(FundingOption.UNDERFUNDED);

  const displayUnderfunded =
    engine.selection.count !== 1 || underfundedAmount > 0;

  /*
   * category selection
   */
  const orderedCategories = userCategoryGroupViews.flatMap(({ rows }) =>
    rows.map((row) => row.category)
  );

  const categorySelector = useCategorySelector({
    orderedCategories: orderedCategories,
  });

  useEffect(() => {
    // Pressing escape clears category inspection
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
    categoryState: {
      currency,
      view: {
        // Data for displaying uncategorisedRow
        uncategorisedRow: uncategorisedRow,
        // Data for displaying the category groups -> categories
        categoriesByGroup: expandCategoryGroups.categoryGroups,
      },

      expandCategoryGroups,
    },

    headerState: {
      currency,
      monthSelector,
      categoriesSelector,
      assignableAmount: rtaRow.month.available,
    },

    // This is a more info
    categoryBreakdown: categoryBreakdown,
    // This is auto assigning
    autoAssign: {
      // used for toggling the pane open and close
      ui: autoAssignUi,
      // hide underfunded when selected cat is already funded
      displayUnderfunded: displayUnderfunded,
      // amount to display
      amount: autoAssign.assignAmount,
      // when clicked generate ui state etc
      handler: autoAssign.runAction,
      modal: autoAssignModal,
    },
    // This is a  notes
    notes: {
      note: note,
      ui: notesUi,
    },

    categorySelector: categorySelector,
  };
}

type UseCategoryGroupViewsArgs = {
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

export function useCategoryGroupViews({
  categoryGroups,
  categories,
  currentCategoryMonthMap,
}: UseCategoryGroupViewsArgs) {
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
