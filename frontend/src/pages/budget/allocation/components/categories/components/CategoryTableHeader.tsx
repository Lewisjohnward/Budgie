import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { CategoryCell, ExpandButton } from "./";
import { darkBlueText } from "@/core/theme/colors";
import { SelectionState } from "../../../hooks/useAllocation/useCategorySelection";
import { toCheckboxState } from "../../../utils/toCheckboxState";

interface CategoryTableHeaderProps {
  showExpandButton: boolean;
  open: boolean;
  onClick: () => void;
  onSelectAllCategories: () => void;
  getAllSelectionState: () => SelectionState;
}

export function CategoryTableHeader({
  showExpandButton,
  open,
  onClick,
  onSelectAllCategories,
  getAllSelectionState,
}: CategoryTableHeaderProps) {
  return (
    <>
      {showExpandButton ? <ExpandButton open={open} onClick={onClick} /> : null}
      <div className="flex justify-start items-center gap-4">
        <Checkbox
          className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
          checked={toCheckboxState(getAllSelectionState())}
          onClick={(e) => {
            e.stopPropagation();
            onSelectAllCategories();
          }}
        />
        <div className={`${darkBlueText} font-[300]`}>CATEGORY</div>
      </div>
      <CategoryCell>
        <span className="text-sky-950 font-[300]">ASSIGNED</span>
      </CategoryCell>
      <CategoryCell>
        <span className="text-sky-950 font-[300]">ACTIVITY</span>
      </CategoryCell>
      <CategoryCell>
        <span className="text-sky-950 font-[400]">AVAILABLE</span>
      </CategoryCell>
    </>
  );
}
