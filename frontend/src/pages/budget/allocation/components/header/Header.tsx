import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { TickIcon } from "@/core/icons/icons";
import {
  darkBlueBgHover,
  darkBlueBgHoverDark,
  darkBlueText,
} from "@/core/theme/colors";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export function MonthSelector({
  prevMonth,
  nextMonth,
  month,
  selectCurrentMonth,
}: {
  prevMonth: () => void;
  nextMonth: () => void;
  month: string;
  selectCurrentMonth: () => void;
}) {
  return (
    <div className="flex flex-grow gap-4 items-center">
      <div className="flex items-center gap-2">
        <button
          onClick={prevMonth}
          className={`hover:${darkBlueBgHover}  rounded-xl w-6 h-6`}
        >
          <ArrowLeftIcon className={`${darkBlueText}`} />
        </button>
        <p className="min-w-max text-xl font-semibold">{month}</p>
        <button
          onClick={nextMonth}
          className={`hover:${darkBlueBgHover} rounded-xl w-6 h-6`}
        >
          <ArrowRightIcon className={`${darkBlueText}`} />
        </button>
      </div>
      <button
        className={`px-2 py-1 bg-sky-950/30 rounded hover:${darkBlueBgHoverDark} hover:text-white`}
        onClick={selectCurrentMonth}
      >
        Today
      </button>
    </div>
  );
}

export function AssignedMoney({ amount }: { amount: number }) {
  const state =
    amount > 0
      ? { bg: "bg-lime-300", message: "Ready to Assign" }
      : amount < 0
        ? { bg: "bg-red-200", message: "You assigned more than you have" }
        : {
            bg: "bg-gray-200",
            message: "All money assigned",
            icon: <TickIcon className="h-8 w-8 text-black/40" />,
          };

  return (
    //TODO: FIX, WHY IS A DIV INSIDE ANOTHER LIKE THIS?
    <div className="flex-grow hidden md:block">
      <div
        className={`flex items-center gap-8 w-56 ${state.bg} rounded px-4 py-2`}
      >
        <div>
          <p className="text-black text-xl font-bold">£{amount.toFixed(2)}</p>
          <p className="text-sm">{state.message}</p>
        </div>
        {state.icon}
      </div>
    </div>
  );
}
