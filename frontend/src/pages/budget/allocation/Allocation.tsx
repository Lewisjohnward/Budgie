import { AssignedMoney, MonthSelector } from "./components/header/Header";
import { ReactNode, useEffect, useState } from "react";
import {
  bgGray,
  borderBottom,
  darkBlueBgHoverDark,
  darkBlueText,
} from "@/core/theme/colors";
import Assign from "./components/assign/Assign";
import { Menu } from "../Budget";
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from "@/core/api/budgetApiSlice";
import Categories from "./components/categories/Categories";
import { normalizedBudgetData } from "./mockData";
import { produce } from "immer";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";
import { AddCircleIcon } from "@/core/icons/icons";
import clsx from "clsx";

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
  //

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
    <AllocationContainer>
      {/* <div className="flex gap-2"> */}
      {/*   <button onClick={prevMonth}>p</button> */}
      {/*   <div className="text-xl font-bold">{currentMonth.formatted}</div> */}
      {/*   <button onClick={nextMonth}>n</button> */}
      {/* </div> */}
      {/* {categoryGroups.map((categoryGroup) => { */}
      {/*   // @ts-ignore */}
      {/*   const { name, categoryIds } = categoryGroup; */}
      {/*   // @ts-ignore */}
      {/*   return ( */}
      {/*     <div> */}
      {/*       <div>{name}</div> */}
      {/*       <div> */}
      {/*         {categoryGroup.categoryIds.map((categoryId) => { */}
      {/*           return ( */}
      {/*             <div> */}
      {/*               <p>{categories[categoryId].name}</p> */}
      {/*               <p>{categories[categoryId].amounts[currentMonth.month]}</p> */}
      {/*             </div> */}
      {/*           ); */}
      {/*         })} */}
      {/*       </div> */}
      {/*     </div> */}
      {/*   ); */}
      {/* })} */}
      <HeaderContainer>
        <div className="flex gap-8 py-4">
          <MonthSelector
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            month={currentMonth?.formattedName || "?"}
          />
          <AssignedMoney />
        </div>
        <CategorySelectorContainer>
          {categoriesSelector.map((catSelector) => (
            <Category key={catSelector} text={catSelector} />
          ))}
          <AddCategoryButton />
        </CategorySelectorContainer>
      </HeaderContainer>

      <BodyContainer>
        <CategoriesContainer>
          <Menu />
          <Categories />
        </CategoriesContainer>
        <AssignContainer>
          <Assign />
        </AssignContainer>
      </BodyContainer>
    </AllocationContainer>
  );
}

function AllocationContainer({ children }: { children: ReactNode }) {
  return <div className="flex-grow flex flex-col">{children}</div>;
}

function BodyContainer({ children }: { children: ReactNode }) {
  return <div className="flex">{children}</div>;
}

function CategoriesContainer({ children }: { children: ReactNode }) {
  return <div className="flex-grow-2"> {children}</div>;
}

function AssignContainer({ children }: { children: ReactNode }) {
  return (
    <div className={`hidden flex-grow xl:flex p-4 ${bgGray}`}>{children}</div>
  );
}

function HeaderContainer({ children }: { children: ReactNode }) {
  return <div className={`px-4 py-2 border-b ${borderBottom}`}>{children}</div>;
}

function CategorySelectorContainer({ children }: { children: ReactNode }) {
  return <div className="gap-2 hidden md:flex"> {children}</div>;
}

function Category({ text }: { text: string }) {
  return (
    <button
      className={`px-2 py-1 ${bgGray} rounded hover:${darkBlueBgHoverDark}`}
    >
      <p className="text-xs">{text}</p>
    </button>
  );
}

function AddCategoryButton() {
  const { mouseOver, handleMouseOver } = useMouseOverTimeout();

  return (
    <button onMouseOver={handleMouseOver}>
      <AddCircleIcon
        className={clsx(
          mouseOver ? "rotate-180" : "",
          `h-4 w-4 ${darkBlueText} transition duration-500`,
        )}
      />
    </button>
  );
}
