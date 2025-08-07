import { useState } from "react";
import { FundingState } from "../types/assignTypes";

export const useModal = () => {
  const [open, setOpen] = useState(false);
  const [fundingState, setFundingState] = useState<FundingState | null>(null);

  const openModal = (uiState: FundingState) => {
    setFundingState(uiState);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setFundingState(null);
  };

  return {
    open,
    fundingState,
    openModal,
    closeModal,
  };
};
