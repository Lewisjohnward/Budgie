import { SelectionState } from "../hooks/useAllocation/useCategorySelection";

export const toCheckboxState = (
  selection: SelectionState
): boolean | "indeterminate" => {
  switch (selection) {
    case "COMPLETE":
      return true;

    case "PARTIAL":
      return "indeterminate";

    case "NONE":
      return false;
  }
};
