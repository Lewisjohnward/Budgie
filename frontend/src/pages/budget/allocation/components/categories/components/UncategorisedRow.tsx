import { Month } from "@/core/types/Allocation";
import { EmptyCell, CategoryCell, Available } from "./";

interface UncategorisedRowProps {
  currency: string;
  month: Month;
}

export function UncategorisedRow({ currency, month }: UncategorisedRowProps) {
  return (
    <>
      <EmptyCell />
      <div className="flex items-center gap-4">
        <div className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none" />
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
