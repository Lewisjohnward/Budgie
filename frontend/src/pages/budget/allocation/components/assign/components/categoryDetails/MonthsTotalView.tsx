import { MonthTotals } from "../../hooks/useSelectedCategories";
import { BalanceRow } from "..";

interface MonthsTotalViewProps {
  monthTotals: MonthTotals;
  currentMonthName: string;
}

export function MonthsTotalView({
  monthTotals,
  currentMonthName,
}: MonthsTotalViewProps) {
  return (
    <div className="p-3 grid grid-rows-[repeat(3,1fr)_40px] gap-1">
      <BalanceRow
        label={"Left Over from Last Month"}
        value={monthTotals.leftover}
        tooltipText="The total amount you have left over from XXX"
      />
      <BalanceRow
        label={`Assigned in ${currentMonthName}`}
        value={monthTotals.assigned}
        tooltipText="The total amount of money you have assigned in XXX"
      />
      <BalanceRow
        label={"Activity"}
        value={monthTotals.spending}
        tooltipText="The total amount of activity (e.g. spending) in XXX"
      />
      <BalanceRow
        label={"Available"}
        value={monthTotals.available}
        tooltipText="The total amount of money you have available in XXX. This includes money left over from previous months"
      />
    </div>
  );
}
