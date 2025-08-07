import { CategoryDetailsToggle } from "./CategoryDetailsToggle";
import { MonthsTotalView } from "./MonthsTotalView";
import { CategoryTotalsView } from "./CategoryTotalsView";
import { SelectedCategoriesState } from "../../hooks/useSelectedCategories";

type CategoryDetailsProps = SelectedCategoriesState;

export function CategoryDetails({
  selectedCategories,
  categoryTotals,
  monthTotals,
  open,
  toggleOpen,
  currentMonthName,
}: CategoryDetailsProps) {
  const hasSelectedCategory = selectedCategories.length === 1;

  return (
    <div className="bg-white rounded">
      <CategoryDetailsToggle
        toggleOpen={toggleOpen}
        open={open}
        currentMonthName={currentMonthName}
        hasSelectedCategories={hasSelectedCategory}
        available={categoryTotals.available}
      />
      {open ? (
        hasSelectedCategory ? (
          <CategoryTotalsView categoryTotals={categoryTotals} />
        ) : (
          <MonthsTotalView
            monthTotals={monthTotals}
            currentMonthName={currentMonthName}
          />
        )
      ) : null}
    </div>
  );
}
