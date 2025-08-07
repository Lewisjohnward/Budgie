import { ReactNode } from "react";
import {
  renderUnderfundedAlreadyFundedContent,
  renderCategoriesContent,
  renderUnderfundedNoMoneyContent,
  renderUnderfundedFundingContent,
} from "./AssignModalContent";
import {
  FundingState,
  FundingStatus,
  FundingLevel,
  NonUnderfundedFundingState,
} from "../../types/assignTypes";

export type ModalStateConfig = {
  title: string;
  content: (fundingState: FundingState) => ReactNode;
  buttons: Array<{
    label: string;
    variant?: "primary" | "secondary";
    action: "close" | "assign" | "nextMonth";
  }>;
};

const createNonUnderfundedModalState = (
  fundingState: NonUnderfundedFundingState
): ModalStateConfig => {
  const titleMap: Record<
    Exclude<FundingStatus, FundingStatus.Underfunded>,
    string
  > = {
    [FundingStatus.AssignedLastMonth]: "Assigned Last Month",
    [FundingStatus.SpentLastMonth]: "Spent Last Month",
    [FundingStatus.AverageAssigned]: "Assign Average Amounts",
    [FundingStatus.AverageSpent]: "Assign Average Spending",
    [FundingStatus.ResetAssigned]: "Reset Assigned Amounts",
    [FundingStatus.ResetAvailable]: "Reset Available Amounts",
  };

  return {
    title: titleMap[fundingState.status],
    content: renderCategoriesContent,
    buttons: fundingState.noCategoriesToUpdate
      ? [{ label: "OK", action: "close" }]
      : [
          { label: "Cancel", action: "close", variant: "secondary" },
          { label: "Update Assigned Amounts", action: "assign" },
        ],
  };
};

const underfundedModalState: Record<string, ModalStateConfig> = {
  [`${FundingStatus.Underfunded}-${FundingLevel.NoMoney}`]: {
    title: "Underfunded",
    content: renderUnderfundedNoMoneyContent,
    buttons: [{ label: "OK", action: "close" }],
  },
  [`${FundingStatus.Underfunded}-${FundingLevel.Funded}`]: {
    title: "Underfunded",
    content: renderUnderfundedFundingContent,
    buttons: [
      { label: "Cancel", action: "close", variant: "secondary" },
      { label: "Assign money", action: "assign" },
    ],
  },
  [`${FundingStatus.Underfunded}-${FundingLevel.AlreadyFunded}`]: {
    title: "Underfunded",
    content: renderUnderfundedAlreadyFundedContent,
    buttons: [
      { label: "Go to Next Month", action: "nextMonth", variant: "secondary" },
      { label: "OK", action: "close" },
    ],
  },
};

const getStateKey = (state: FundingState): string => {
  if (state.status === FundingStatus.Underfunded) {
    return `${state.status}-${state.fundingLevel}`;
  }
  return state.status;
};

export const getModalState = (fundingState: FundingState) => {
  if (fundingState.status !== FundingStatus.Underfunded) {
    return createNonUnderfundedModalState(fundingState);
  }

  const stateKey = getStateKey(fundingState);
  const currentState = underfundedModalState[stateKey];

  if (!currentState) {
    console.warn(`Unknown state: ${stateKey}`);
    return null;
  }

  return currentState;
};
