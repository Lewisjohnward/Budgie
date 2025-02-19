import { ReactNode, useEffect, useState } from "react";
import Assign from "./components/assign/Assign";
import { Menu } from "../Budget";
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import { normalizedBudgetData } from "./mockData";
function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
  });
}

function useAllocation() {
  useEffect(() => {}, []);

  const [allocationData, setAllocationData] = useState(
    produce(normalizedBudgetData, (draft) => {
      Object.values(draft.months).forEach((month) => {
        month.current = false;
      });
    }),
  );

  const [selector, setSelector] = useState(0);
  const maxSelector = Object.keys(normalizedBudgetData).length - 1;
  const minSelector = 0;

  const { categoryGroups, categories } = allocationData;
  const months = Object.values(normalizedBudgetData.months).map((month, i) => ({
    ...month,
    current: i === selector ? true : false,
    formattedName: formatDate(month.month),
  }));

  const currentMonth = months.find((month) => month.current);

  const derivedCategoryGroups = currentMonth.categoryGroupIds.map(
    (catGroupId) => categoryGroups[catGroupId],
  );

  const nextMonth = () =>
    setSelector((prev) => (prev + 1 < maxSelector ? prev + 1 : prev));
  const prevMonth = () =>
    setSelector((prev) => (prev - 1 >= minSelector ? prev - 1 : prev));

  const categoriesSelector = [
    "All",
    "Underfunded",
    "Money available",
    "Snoozed",
  ];

  return {
    currentMonth,
    categoriesSelector,
    categoryGroups: derivedCategoryGroups,
    categories,
    nextMonth,
    prevMonth,
  };
}

export function Allocation() {
  const { isLoading: isLoadingAccounts } = useGetAccountsQuery();
  const { isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const {
    categoriesSelector,
    currentMonth,
    categoryGroups,
    categories,
    nextMonth,
    prevMonth,
  } = useAllocation();

  if (isLoadingCategories || isLoadingAccounts) return "...Loading";

  return (
    <AllocationLayout
      header={<Header />}
      menu={<Menu />}
      categories={<Body />}
      assign={<Assign />}
    />
  );
}
function AllocationLayout({
  header,
  menu,
  categories,
  assign,
}: {
  header: ReactNode;
  menu?: ReactNode;
  categories: ReactNode;
  assign: ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col">
      <div className={`px-4 py-2 border-b ${borderBottom}`}>{header}</div>
      <div className="overflow-hidden flex-grow flex">
        <div className="flex-grow-2 flex flex-col">
          <div className="border-r border-r-gray-300">
            <div className="py-1 border-b border-b-gray-200">{menu}</div>
            {categories}
          </div>
        </div>
        <div
          className={`overflow-scroll hidden flex-grow xl:flex p-4 ${bgGray}`}
        >
          {assign}
        </div>
      </div>
    </div>
  );
}
