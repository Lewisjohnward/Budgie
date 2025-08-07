import { CategoryTotals } from "../../hooks/useSelectedCategories";
import { BalanceRow } from "..";
import { OverspentWarning } from "./OverspentWarning";

interface CategoryTotalsViewProps {
  categoryTotals: CategoryTotals;
}

export function CategoryTotalsView({
  categoryTotals,
}: CategoryTotalsViewProps) {
  return (
    <div className="p-3 space-y-1" id="category-details">
      <BalanceRow
        label={"Cash Left Over from Last Month"}
        value={categoryTotals.leftover}
      />
      <BalanceRow
        label={"Assigned this month"}
        value={categoryTotals.assigned}
      />
      <BalanceRow label={"Cash Spending"} value={categoryTotals.spending} />
      {/* <BalanceRow */}
      {/*   label={"Future credit spending"} */}
      {/*   value={categoryTotals.futureCredit} */}
      {/* /> */}
      {categoryTotals.available < 0 && (
        <OverspentWarning available={categoryTotals.available} />
      )}
    </div>
  );
}
