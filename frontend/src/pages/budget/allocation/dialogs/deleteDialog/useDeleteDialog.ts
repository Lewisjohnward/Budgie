import { useState } from "react";
import {
  CategorySelectOptions,
  ExcludeTarget,
} from "../../hooks/useAllocation/useAllocation";
import { CategoryId, CategoryGroupId } from "../../types/types";
import { DeleteState } from "./DeleteDialog";

export type DeleteArgs =
  | {
      type: "category";
      categoryId: CategoryId;
      inheritingCategoryId?: CategoryId;
    }
  | { type: "categoryGroup"; categoryGroupId: CategoryGroupId };

// Input
type UseDeleteDialogParams = {
  onDelete: (args: DeleteArgs) => void;
  getSelectOptions: (exclude?: ExcludeTarget) => CategorySelectOptions;
};

// Output
export type DeleteDialogReturn = {
  open: boolean;
  state: DeleteState | null;
  selectOptions: CategorySelectOptions | null;

  openDialog: (state: DeleteState) => void;
  closeDialog: () => void;

  accept: (args: DeleteArgs) => void;
  cancel: () => void;
};

export function useDeleteDialog({
  onDelete,
  getSelectOptions,
}: UseDeleteDialogParams): DeleteDialogReturn {
  const [open, setOpen] = useState(false);
  const [selectOptions, setSelectOptions] =
    useState<CategorySelectOptions | null>(null);
  const [state, setState] = useState<DeleteState | null>(null);

  const openDialog = (state: DeleteState) => {
    setState(state);
    const options = getSelectOptions(
      state.type === "category"
        ? { type: "category", id: state.categoryId }
        : { type: "categoryGroup", id: state.categoryGroupId }
    );
    setSelectOptions(options);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setState(null);
  };

  const accept = (args: DeleteArgs) => {
    onDelete(args);
    closeDialog();
  };

  const cancel = () => {
    closeDialog();
  };

  return {
    open,
    state,
    openDialog,
    selectOptions,
    closeDialog,
    accept,
    cancel,
  };
}
