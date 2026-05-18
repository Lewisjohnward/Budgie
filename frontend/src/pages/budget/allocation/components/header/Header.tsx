import {
  ReadyToAssign,
  MonthSelector,
  CategoryFilters,
  HeaderLayout,
} from "./components";
import { MonthSelectorViewModel } from "../../hooks/useMonthSelector";
import { RtaInformation } from "../../hooks/useAllocation/useAllocation";

type HeaderProps = {
  currency: string;
  monthSelectorViewModel: MonthSelectorViewModel;
  categoriesSelector: string[];
  rtaInformation: RtaInformation;
};

export function Header({
  currency,
  monthSelectorViewModel,
  categoriesSelector,
  rtaInformation,
}: HeaderProps) {
  return (
    <HeaderLayout
      monthSelector={
        <MonthSelector monthSelectorViewModel={monthSelectorViewModel} />
      }
      readyToAssign={
        <ReadyToAssign currency={currency} rtaInformation={rtaInformation} />
      }
      categoryFilters={<CategoryFilters categories={categoriesSelector} />}
    />
  );
}
