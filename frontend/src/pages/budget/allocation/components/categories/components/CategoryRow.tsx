import { CategoryUserBranded, MonthBranded } from "@/core/types/NormalizedData";
import { useRef } from "react";
import { calculateBarColors } from "../../../utils/calculateBarColors";
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
import { formatCurrency } from "@/utils/formatCurrency";

type CategoryRowProps = {
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  category: CategoryUserBranded;
  month: MonthBranded;
  // TODO:(lewis 2026-05-15 15:06) i dont like neither the name or the type, i think it should be categorySelector
  categorySelection: CategorySelectionState;
};

export function CategoryRow({
  onContextMenu,
  category,
  month,
  categorySelection,
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

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    inputRef.current?.focus();
    categorySelection.onRowClick(e, category);
  };

  const isRowSelected = categorySelection.isSelected(category.id);

  const values = calculateBarColors({ activity, available, assigned });

  return (
    <div
      onContextMenu={onContextMenu}
      onClick={handleRowClick}
      className={`${isRowSelected ? "bg-gray-100" : "bg-white"} cursor-pointer`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CategoryGridRow aria-label={`${category.name} category`}>
        <EmptyCell />
        <div className="flex items-center min-w-0 gap-4">
          <Checkbox
            aria-label={`Select ${category.name}`}
            className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
            checked={isRowSelected}
            onCheckedChange={() => categorySelection.toggle(category)}
            onClick={(e) => {
              e.stopPropagation();
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
        <CategoryCell ariaLabel="activity">
          {formatCurrency(month.activity)}
        </CategoryCell>
        <CategoryCell ariaLabel="available">
          <Available value={month.available} />
        </CategoryCell>
      </CategoryGridRow>
    </div>
  );
}
