import {
  CategoryBranded,
  CategoryGroupBranded,
  MonthBranded,
} from "@/core/types/NormalizedData";
import {
  useToggle,
  useUpdateMonths,
  useAutoAssignModal,
} from "../../components/assign/hooks";
import { UseAutoAssignModalReturn } from "../../components/assign/hooks/useAutoAssignModal";
import { FundingOption } from "../../components/assign/types/assignTypes";
import { CategoryId } from "../../types/types";
import { useAutoAssignEngine } from "./useAutoAssignEngine";

// Input
type UseAutoAssignParams = {
  categories: Record<string, CategoryBranded>;
  categoryGroups: Record<string, CategoryGroupBranded>;

  isUncategorisedSelected: boolean;

  currentMonths: MonthBranded[];
  previousMonths: MonthBranded[];
  previousYearMonths: MonthBranded[];

  rtaAvailable: number;
  selectedCategoryIds: CategoryId[];
  autoAccept: boolean;
  goToNextOrPreviousMonth: () => void;
};

// Output
type AutoAssignState = {
  ui: {
    value: boolean;
    toggle: () => void;
  };
  hideAutoAssign: boolean;
  displayUnderfunded: boolean;
  amount: (action: FundingOption) => number;
  handler: (action: FundingOption) => void;
  modal: UseAutoAssignModalReturn;
};

export function useAutoAssign({
  categories,
  categoryGroups,

  isUncategorisedSelected,

  currentMonths,
  previousMonths,
  previousYearMonths,

  rtaAvailable,
  selectedCategoryIds,
  autoAccept,

  goToNextOrPreviousMonth,
}: UseAutoAssignParams): AutoAssignState {
  const autoAssignUi = useToggle(true);

  const { updateMonths } = useUpdateMonths();

  const autoAssignModal = useAutoAssignModal({
    onConfirm: updateMonths,
    continueToNextMonth: goToNextOrPreviousMonth,
  });

  const autoAssign = useAutoAssignEngine({
    categories,
    categoryGroups,
    currentMonths,
    previousMonths,
    previousYearMonths,
    rtaAvailable,
    selectedCategoryIds,
    autoAccept,
    modal: {
      open: autoAssignModal.open,
    },
    updateMonths,
  });

  const underfundedAmount = autoAssign.assignAmount(FundingOption.UNDERFUNDED);

  const displayUnderfunded =
    selectedCategoryIds.length !== 1 || underfundedAmount > 0;

  // hide auto assign panel when uncategorised is the only selected category
  const hideAutoAssign =
    selectedCategoryIds.length === 1 && isUncategorisedSelected;

  return {
    // used for toggling the pane open and close
    ui: autoAssignUi,
    // hide underfunded when selected cat is already funded
    displayUnderfunded: displayUnderfunded,
    // hide entire auto assign panel when only uncategorised category is selected (when visible)
    hideAutoAssign,
    // amount to display
    amount: autoAssign.assignAmount,
    // when clicked generate ui state etc
    handler: autoAssign.runAction,

    modal: autoAssignModal,
  };
}
