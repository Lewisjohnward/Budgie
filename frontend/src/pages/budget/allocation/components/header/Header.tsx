import {
  ReadyToAssign,
  MonthSelector,
  CategoryFilters,
  HeaderLayout,
} from "./components";
import { HeaderState } from "../../hooks/useAllocation/useAllocation";

export function Header({
  monthSelector,
  assignableAmount,
  categoriesSelector,
}: HeaderState) {
  return (
    <HeaderLayout
      monthSelector={<MonthSelector monthSelector={monthSelector} />}
      readyToAssign={<ReadyToAssign amount={assignableAmount} />}
      categoryFilters={<CategoryFilters categories={categoriesSelector} />}
    />
  );
}
