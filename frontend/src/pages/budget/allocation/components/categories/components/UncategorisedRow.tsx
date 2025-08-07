import { EmptyCell, CategoryCell, Available } from "./";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";

interface UncategorisedRowProps {
  currency: string;
  activity: number;
  available: number;
}

export function UncategorisedRow({
  currency,
  activity,
  available,
}: UncategorisedRowProps) {
  return (
    <>
      <EmptyCell />
      <div className="flex items-center gap-4">
        <Checkbox className="size-3 rounded-[2px] shadow-none" />
        <p>Uncategorised Transactions</p>
      </div>
      <p className="px-[5px] text-right">-</p>
      <CategoryCell>
        {currency} {activity.toFixed(2)}
      </CategoryCell>
      <CategoryCell>
        <Available value={available} />
      </CategoryCell>
    </>
  );
}
