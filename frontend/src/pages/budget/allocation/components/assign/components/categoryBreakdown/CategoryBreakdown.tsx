import { CategoryDetailsToggle } from "./CategoryDetailsToggle";
import { BalanceRow } from "../shared/BalanceRow";
import { OverspentWarning } from "./OverspentWarning";
import { CategoryBreakdownViewModel } from "@/pages/budget/allocation/hooks/useAllocation/useCategoryBreakdown";

type CategoryBreakdownProps = {
  categoryBreakdownViewModel: CategoryBreakdownViewModel;
};

export function CategoryBreakdown({
  categoryBreakdownViewModel: {
    totals,
    open,
    toggleOpen,
    currentMonthName,
    view,
  },
}: CategoryBreakdownProps) {
  const isSingle = view.kind === "single";

  const showDashValues = isSingle && view.isUncategorisedSelected;

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
        view={view.kind}
        available={totals.available}
      />

      {open && (
        <div className="p-3 space-y-1" id="category-details">
          <BalanceRow
            label={labels.leftover}
            value={totals.leftover}
            showDashValues={showDashValues}
          />

          <BalanceRow
            label={"Assigned this month"}
            value={totals.assigned}
            showDashValues={showDashValues}
          />

          <BalanceRow label={labels.spending} value={totals.spending} />

          {isSingle ? (
            totals.available < 0 && (
              <OverspentWarning
                available={totals.available}
                uncategorisedSelected={view.isUncategorisedSelected}
              />
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
