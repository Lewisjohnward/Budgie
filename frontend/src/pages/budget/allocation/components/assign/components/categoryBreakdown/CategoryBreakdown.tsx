import { CategoryDetailsToggle } from "./CategoryDetailsToggle";
import { BalanceRow } from "../shared/BalanceRow";
import { OverspentWarning } from "./OverspentWarning";
type CategoryDetailsProps = SelectedCategoriesState;

export function CategoryBreakdown({
  totals,
  open,
  toggleOpen,
  currentMonthName,
  view,
}: CategoryDetailsProps) {
  const isSingle = view === "single";

  const labels = {
    leftover: isSingle
      ? "Cash Left Over from Last Month"
      : "Left Over from Last Month",

    spending: isSingle ? "Cash Spending" : "Activity",
  };
  return (
    <div className="bg-white rounded">
      <CategoryDetailsToggle
        toggleOpen={toggleOpen}
        open={open}
        currentMonthName={currentMonthName}
        view={view}
        available={totals.available}
      />

      {open && (
        <div className="p-3 space-y-1" id="category-details">
          <BalanceRow label={labels.leftover} value={totals.leftover} />

          <BalanceRow label={"Assigned this month"} value={totals.assigned} />

          <BalanceRow label={labels.spending} value={totals.spending} />

          {isSingle ? (
            totals.available < 0 && (
              <OverspentWarning available={totals.available} />
            )
          ) : (
            <div className="pt-4">
              <BalanceRow label={"Available"} value={totals.available} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
