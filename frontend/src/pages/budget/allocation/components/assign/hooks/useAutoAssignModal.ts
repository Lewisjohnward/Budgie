import { useState } from "react";
import { FundingState, MonthsToUpdate } from "../types/assignTypes";

type AutoAssignPayload = {
  uiState: FundingState;
  monthsToUpdate: MonthsToUpdate[];
};

// Input
type UseAutoAssignModalParams = {
  onConfirm: (months: MonthsToUpdate[]) => void;
  continueToNextMonth: () => void;
};

// Output
export type UseAutoAssignModalReturn = {
  isOpen: boolean;
  fundingState: FundingState | null;

  open: (payload: AutoAssignPayload) => void;
  close: () => void;
  confirm: () => void;
  goToNextMonth: () => void;
};

export const useAutoAssignModal = ({
  onConfirm,
  continueToNextMonth,
}: UseAutoAssignModalParams): UseAutoAssignModalReturn => {
  const [open, setOpen] = useState(false);
  const [fundingState, setFundingState] = useState<FundingState | null>(null);
  const [monthsToUpdate, setMonthsToUpdate] = useState<MonthsToUpdate[]>([]);

  const isOpen = open;

  const handleOpen = (payload: AutoAssignPayload) => {
    setFundingState(payload.uiState);
    setMonthsToUpdate(payload.monthsToUpdate);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFundingState(null);
    setMonthsToUpdate([]);
  };

  const handleConfirm = () => {
    onConfirm(monthsToUpdate);
    handleClose();
  };

  const handleGoToNextMonth = () => {
    continueToNextMonth();
    handleClose();
  };

  return {
    isOpen,
    fundingState,
    open: handleOpen,
    close: handleClose,
    confirm: handleConfirm,
    goToNextMonth: handleGoToNextMonth,
  };
};
