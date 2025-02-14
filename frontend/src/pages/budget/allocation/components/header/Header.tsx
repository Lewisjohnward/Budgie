import {
  bgGray,
  darkBlueBgHover,
  darkBlueBgHoverDark,
  darkBlueText,
} from "@/core/theme/colors";
import { TickIcon, AddCircleIcon } from "@/core/icons/icons";
import clsx from "clsx";
import { ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";
import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";

export default function Header() {
  const categories = ["All", "Underfunded", "Money available", "Snoozed"];

  return (
    <Layout
      monthSelector={<MonthSelector />}
      assignedMoney={<AssignedMoney />}
      categorySelector={
        <>
          {categories.map((category, i) => (
            <Category key={i} text={category} />
          ))}
        </>
      }
      addCategory={<AddCategoryButton />}
    />
  );
}

function Layout({
  monthSelector,
  assignedMoney,
  categorySelector,
  addCategory,
}: {
  monthSelector: ReactNode;
  assignedMoney: ReactNode;
  categorySelector: ReactNode;
  addCategory: ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-4 py-4">
        {monthSelector}
        <div className="flex-grow hidden md:block">{assignedMoney}</div>
        <div className="flex-grow" />
      </div>
      <div className="gap-2 hidden md:flex">
        {categorySelector}
        {addCategory}
      </div>
    </div>
  );
}

function MonthSelector() {
  const month = "Nov 24";
  return (
    <div className="flex flex-grow gap-4 items-center">
      <div className="flex items-center gap-2">
        <button className={`hover:${darkBlueBgHover}  rounded-xl w-6 h-6`}>
          <ArrowLeftIcon className={`${darkBlueText}`} />
        </button>
        <p className="min-w-max text-xl font-semibold">{month}</p>
        <button className={`hover:${darkBlueBgHover} rounded-xl w-6 h-6`}>
          <ArrowRightIcon className={`${darkBlueText}`} />
        </button>
      </div>
      <button
        className={`px-2 py-1 bg-sky-950/30 rounded hover:${darkBlueBgHoverDark} hover:text-white`}
      >
        Today
      </button>
    </div>
  );
}

function AssignedMoney() {
  const { data } = useGetCategoriesQuery();

  const inflowGroup = Object.values(data.categoryGroups).find(
    (group) => group.name === "Inflow",
  );
  const categoryId = inflowGroup.categories[0];
  const inflowCategory = data.categories[categoryId];
  const assignedValue = inflowCategory?.assigned ?? null;

  const state =
    assignedValue > 0
      ? { bg: "bg-lime-300", message: "Ready to Assign" }
      : assignedValue < 0
        ? { bg: "bg-red-200", message: "You assigned more than you have" }
        : {
          bg: "bg-gray-200",
          message: "All money assigned",
          icon: <TickIcon className="h-8 w-8 text-black/40" />,
        };

  return (
    <div className="min-w-max">
      <div
        className={`flex items-center gap-8 w-56 ${state.bg} rounded px-4 py-2`}
      >
        <div>
          <p className="text-black text-xl font-bold">
            £{assignedValue.toFixed(2)}
          </p>
          <p className="text-sm">{state.message}</p>
        </div>
        {state.icon}
      </div>
    </div>
  );
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
