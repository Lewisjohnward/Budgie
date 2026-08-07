import { ExpandButton, CategoryCell } from "./";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { AddCircleIcon } from "@/core/icons/icons";
import { darkBlueText } from "@/core/theme/colors";
import { AddCategoryPopover } from "../../../popovers/AddCategoryPopover";
import { CategoryGroupId } from "../../../types/types";
import { toCheckboxState } from "../../../utils/toCheckboxState";
import { SelectionState } from "../../../hooks/useAllocation/useCategorySelection";

interface CategoryGroupRowProps {
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  categoryGroup: {
    id: CategoryGroupId;
    name: string;
    assigned: number;
    activity: number;
    available: number;
  };
  open: boolean;
  currency: string;
  onExpandClick: () => void;
  selectionState: SelectionState;
  onGroupClick: (id: CategoryGroupId) => void;
}

export function CategoryGroupRow({
  onContextMenu,
  categoryGroup,
  currency,
  onExpandClick,
  open,
  selectionState,
  onGroupClick,
}: CategoryGroupRowProps) {
  return (
    <div className="flex items-center gap-4 min-w-0">
      <ExpandButton open={open} onClick={onExpandClick} />
      <div className="flex">
        <Checkbox
          className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
          checked={toCheckboxState(selectionState)}
          onClick={() => onGroupClick(categoryGroup.id)}
        />
        <p
          onContextMenu={onContextMenu}
          className={`${darkBlueText} font-bold truncate cursor-pointer`}
        >
          {categoryGroup.name}
        </p>
        <AddCategoryPopover id={categoryGroup.id}>
          <AddCircleIcon
            className={`${darkBlueText} invisible group-hover:visible`}
          />
        </AddCategoryPopover>
      </div>
      <CategoryCell>
        {currency} {categoryGroup.assigned.toFixed(2)}
      </CategoryCell>
      <CategoryCell>
        {currency} {categoryGroup.activity.toFixed(2)}
      </CategoryCell>
      <CategoryCell>
        <span className="px-1">
          {currency} {categoryGroup.available.toFixed(2)}
        </span>
      </CategoryCell>
    </div>
  );
}
