import { CategoryBranded, MonthBranded } from "@/core/types/NormalizedData";
import { useRef } from "react";
import { calculateBarColors } from "../../../utils/calculateBarColors";
import { CategoryContextMenu } from "../../../contextMenus/CategoryContextMenu";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import {
  EmptyCell,
  CategoryGridRow,
  Available,
  CategoryCell,
  ProgressBar,
  AssignedAmountField,
} from "./";
import { CategorySelectionState } from "../../../hooks/useAllocation/useCategorySelection";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoryId } from "../../../types/types";
import { CategoryDeleteState } from "../../../utils/getCategoryDeleteState";
import {
  ExcludeTarget,
  CategorySelectOptions,
} from "../../../hooks/useAllocation/useAllocation";

type CategoryRowProps = {
  category: CategoryBranded;
  month: MonthBranded;
  // TODO:(lewis 2026-05-15 15:06) i dont like neither the name or the type, i think it should be categorySelector
  categorySelection: CategorySelectionState;
  getCategoryDeleteState: (categoryId: CategoryId) => CategoryDeleteState;
  getCategorySelectOptions: (exclude?: ExcludeTarget) => CategorySelectOptions;
};

export function CategoryRow({
  category,
  month,
  categorySelection,
  getCategoryDeleteState,
  getCategorySelectOptions,
}: CategoryRowProps) {
  const { activity, available, assigned } = month;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: "category",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const currency = "£";

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    inputRef.current?.focus();
    categorySelection.onRowClick(e, category);
  };

  const isRowSelected = categorySelection.isSelected(category.id);

  const values = calculateBarColors({ activity, available, assigned });

  return (
    <CategoryContextMenu
      category={category}
      getCategoryDeleteState={getCategoryDeleteState}
      getCategorySelectOptions={getCategorySelectOptions}
    >
      <div
        onClick={handleRowClick}
        className={`${isRowSelected ? "bg-gray-100" : "bg-white"} cursor-pointer`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <CategoryGridRow>
          <EmptyCell />
          <div className="flex items-center min-w-0 gap-4">
            <Checkbox
              className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
              checked={isRowSelected}
              onClick={(e) => {
                e.stopPropagation();
                categorySelection.toggle(category);
              }}
            />
            <div className="w-5/6">
              <div className="flex justify-between items-center gap-8">
                <p className="truncate">{category.name}</p>
                <div className="flex gap-2">
                  <p className="text-sm font-[500] text-gray-600 whitespace-nowrap">
                    {values.message?.important ?? ""}
                  </p>
                  {values.message?.text && (
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      {values.message.text ?? ""}
                    </p>
                  )}
                </div>
              </div>
              <ProgressBar
                spent={values.green}
                available={values.lightGreen}
                overspent={values.red}
              />
            </div>
          </div>
          <AssignedAmountField
            ref={inputRef}
            assigned={month.assigned}
            monthId={month.id}
          />
          <CategoryCell>
            {currency} {month.activity.toFixed(2)}
          </CategoryCell>
          <CategoryCell>
            <Available value={month.available} />
          </CategoryCell>
        </CategoryGridRow>
      </div>
    </CategoryContextMenu>
  );
}
