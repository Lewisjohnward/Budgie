import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import { month, selectMonthIndex } from "../../../slices/monthSlice";
import { useState } from "react";
import {
  FundingState,
  MonthsToUpdate,
  FundingOption,
} from "../types/assignTypes";
import {
  generateUnderfundedState,
  generateResetAssignedState,
  generateResetAvailableState,
  generateSpentLastMonthState,
  generateAssignedLastMonthState,
  generateAverageAssignedState,
  generateAverageSpentState,
  calculateAverageSpent,
} from "../utils";
import { useCategories, useModal, useUpdateMonths, useToggle } from "./";
import { calculateAverageAssigned } from "../utils/calculateAverageAssigned";

export const useAutoAssign = () => {
  const dispatch = useAppDispatch();
  const { updateMonths } = useUpdateMonths();
  const { monthIndex } = useAppSelector(month);
  const [monthsToUpdate, setMonthsToUpdate] = useState<MonthsToUpdate[]>([]);
  const {
    allMonths,
    currentMonths,
    previousMonths,
    categories,
    categoryGroups,
    rtaAvailable,
    selectedCategories,
    uniqueMonths,
  } = useCategories();

  const { value: open, toggle: toggleOpen } = useToggle(true);

  const modal = useModal();

  const createFundingAction = (
    generateFundingState: () => {
      monthsToUpdate: MonthsToUpdate[];
      uiState: FundingState;
    },
    autoAccept: boolean = false
  ) => {
    const { uiState, monthsToUpdate } = generateFundingState();
    if (autoAccept) {
      if (monthsToUpdate.length === 0) return;
      updateMonths(monthsToUpdate);
    } else {
      setMonthsToUpdate(monthsToUpdate);
      modal.openModal(uiState);
    }
  };

  const handleModalConfirm = () => {
    updateMonths(monthsToUpdate);
    modal.closeModal();
  };

  const handleNextMonth = () => {
    const nextIndex = monthIndex + 1;
    if (nextIndex < uniqueMonths.length) {
      dispatch(selectMonthIndex(nextIndex));
    } else {
      dispatch(selectMonthIndex(monthIndex - 1));
    }
    modal.closeModal();
  };

  const fundingAction = (action: FundingOption) => {
    const autoAccept = selectedCategories.length !== 0;
    switch (action) {
      case FundingOption.UNDERFUNDED:
        return createFundingAction(
          () =>
            generateUnderfundedState(
              categoryGroups,
              categories,
              currentMonths,
              rtaAvailable,
              autoAccept
            ),
          autoAccept
        );
      case FundingOption.ASSIGN_LAST_MONTH:
        return createFundingAction(
          () =>
            generateAssignedLastMonthState(
              categoryGroups,
              categories,
              currentMonths,
              previousMonths
            ),
          autoAccept
        );
      case FundingOption.SPENT_LAST_MONTH:
        return createFundingAction(
          () =>
            generateSpentLastMonthState(
              categoryGroups,
              categories,
              currentMonths,
              previousMonths
            ),
          autoAccept
        );
      case FundingOption.AVERAGE_ASSIGNED:
        return createFundingAction(
          () =>
            generateAverageAssignedState(
              categoryGroups,
              categories,
              monthIndex,
              allMonths
            ),
          autoAccept
        );
      case FundingOption.AVERAGE_SPENT:
        return createFundingAction(
          () =>
            generateAverageSpentState(
              categoryGroups,
              categories,
              monthIndex,
              allMonths
            ),
          autoAccept
        );
      case FundingOption.RESET_ASSIGNED:
        return createFundingAction(
          () =>
            generateResetAssignedState(
              categoryGroups,
              categories,
              currentMonths
            ),
          autoAccept
        );
      case FundingOption.RESET_AVAILABLE:
        return createFundingAction(
          () =>
            generateResetAvailableState(
              categoryGroups,
              categories,
              currentMonths
            ),
          autoAccept
        );
    }
  };

  const fundingAmount = (action: FundingOption) => {
    switch (action) {
      case FundingOption.UNDERFUNDED:
        const unfundedMonths = currentMonths.filter((m) => m.available < 0);
        const unfundedSum = unfundedMonths.reduce((acc, el) => {
          if (el.available < 0) {
            return acc + el.available;
          }
          return acc;
        }, 0);
        return -unfundedSum;
      case FundingOption.ASSIGN_LAST_MONTH:
        const assignedLastMonth = previousMonths.reduce(
          (sum, m) => sum + m.assigned,
          0
        );
        return assignedLastMonth;
      case FundingOption.SPENT_LAST_MONTH:
        const spentLastMonth = previousMonths.reduce(
          (sum, m) => sum + m.activity,
          0
        );
        return -spentLastMonth;
      case FundingOption.AVERAGE_ASSIGNED:
        const { totalAverageAssigned } = calculateAverageAssigned(
          allMonths,
          monthIndex
        );
        return totalAverageAssigned;
      case FundingOption.AVERAGE_SPENT:
        const { totalAverageSpend } = calculateAverageSpent(
          allMonths,
          monthIndex
        );
        return -totalAverageSpend;
      case FundingOption.RESET_ASSIGNED:
        return 0;
      case FundingOption.RESET_AVAILABLE:
        return 0;
    }
  };

  return {
    assign: {
      // amount to display
      amount: fundingAmount,
      // hide for underfunded when selected cat is already funded
      display:
        selectedCategories.length === 0 ||
        (fundingAmount(FundingOption.UNDERFUNDED) !== 0 &&
          selectedCategories.length > 0),
      // when clicked generate ui state etc
      handler: fundingAction,
    },
    modal: {
      open: modal.open,
      toggleOpen: modal.closeModal,
      fundingState: modal.fundingState,
      onConfirm: handleModalConfirm,
      onClose: modal.closeModal,
      onNextMonth: handleNextMonth,
    },
    // used for toggling open and close the pane
    ui: {
      open,
      toggleOpen,
    },
  };
};

export type AutoAssignState = ReturnType<typeof useAutoAssign>;
export type AutoAssignModalState = AutoAssignState["modal"];
export { FundingOption };
