import { Month } from "@/core/types/Allocation";
import { EmptyCell, CategoryCell, Available } from "./";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { CategorySelectionState } from "../../../hooks/useAllocation/useCategorySelection";
import { CategorySystemBranded } from "@/core/types/NormalizedData";

interface UncategorisedRowProps {
  currency: string;
  month: Month;
  category: CategorySystemBranded;
  categorySelector: CategorySelectionState;
}

export function UncategorisedRow({
  currency,
  month,
  category,
  categorySelector,
}: UncategorisedRowProps) {
  const isRowSelected = categorySelector.isSelected(category.id);
  return (
    <>
      <EmptyCell />
      <div className="flex items-center gap-4">
        <Checkbox
          aria-label={"Select Uncategorised"}
          className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
          checked={isRowSelected}
          onClick={(e) => {
            e.stopPropagation();
            categorySelector.toggle(category);
          }}
        />
        <p>Uncategorised Transactions</p>
      </div>
      <p className="px-[5px] text-right">-</p>
      <CategoryCell>
        {currency} {month.activity.toFixed(2)}
      </CategoryCell>
      <CategoryCell>
        <Available value={month.available} />
      </CategoryCell>
    </>
  );
}
