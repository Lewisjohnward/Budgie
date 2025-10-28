import { ExpandButton, CategoryCell } from "./";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { AddCircleIcon } from "@/core/icons/icons";
import { darkBlueText } from "@/core/theme/colors";
import { AddCategoryPopover } from "../../../popovers/AddCategoryPopover";

interface CategoryGroupRowProps {
  categoryGroup: {
    id: string;
    name: string;
    open: boolean;
    assigned: string;
    activity: string;
    available: string;
  };
  currency: string;
  onExpandClick: () => void;
}

export function CategoryGroupRow({
  categoryGroup,
  currency,
  onExpandClick,
}: CategoryGroupRowProps) {
  return (
    <>
      <ExpandButton open={categoryGroup.open} onClick={onExpandClick} />
      <div className="flex min-w-0 items-center gap-2">
        <Checkbox className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none" />
        <p className={`${darkBlueText} font-bold truncate`}>
          {categoryGroup.name}
        </p>
        <AddCategoryPopover id={categoryGroup.id}>
          <AddCircleIcon
            className={`${darkBlueText} invisible group-hover:visible`}
          />
        </AddCategoryPopover>
      </div>
      <CategoryCell>
        {currency} {categoryGroup.assigned}
      </CategoryCell>
      <CategoryCell>
        {currency} {categoryGroup.activity}
      </CategoryCell>
      <CategoryCell>
        <span className="px-1">
          {currency} {categoryGroup.available}
        </span>
      </CategoryCell>
    </>
  );
}
