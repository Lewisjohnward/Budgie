import {
  ReadyToAssign,
  MonthSelector,
  CategoryFilters,
  HeaderLayout,
} from "./components";
import { MonthSelectorState } from "../../hooks/useMonthSelector";
import { RtaInformation } from "../../hooks/useAllocation/useAllocation";

type HeaderProps = {
  currency: string;
  monthSelector: MonthSelectorState;
  categoriesSelector: string[];
  rtaInformation: RtaInformation;
};

export function Header({
  currency,
  monthSelector,
  categoriesSelector,
  rtaInformation,
}: HeaderProps) {
  return (
    <HeaderLayout
      monthSelector={<MonthSelector monthSelector={monthSelector} />}
      readyToAssign={
        <ReadyToAssign currency={currency} rtaInformation={rtaInformation} />
      }
      categoryFilters={<CategoryFilters categories={categoriesSelector} />}
    />
  );
}
