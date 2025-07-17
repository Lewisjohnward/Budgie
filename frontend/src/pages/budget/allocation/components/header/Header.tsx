import { TickIcon } from "@/core/icons/icons";
import { darkBlueBgHover, darkBlueText } from "@/core/theme/colors";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { MonthType } from "../../hooks/useMonthSelector";

export function MonthSelector({ month }: { month: MonthType }) {
  return (
    <div className="flex flex-grow gap-4 items-center">
      <div className="flex items-center gap-1">
        <button
          onClick={month.prev}
          disabled={!month.canGoPrev}
          className={`rounded-xl w-6 h-6 ${
            !month.canGoPrev
              ? "opacity-50"
              : `hover:${darkBlueBgHover} cursor-pointer`
          }`}
        >
          <ArrowLeftIcon className={`${darkBlueText}`} />
        </button>
        <p className="w-24 text-center text-xl font-semibold">
          {month.current}
        </p>
        <button
          onClick={month.next}
          disabled={!month.canGoNext}
          className={`rounded-xl w-6 h-6 ${
            !month.canGoNext
              ? "opacity-50"
              : `hover:${darkBlueBgHover} cursor-pointer`
          }`}
        >
          <ArrowRightIcon className={`${darkBlueText}`} />
        </button>
      </div>
      <button
        disabled={month.isCurrentMonth}
        className={`px-2 py-1 rounded ${
          month.isCurrentMonth
            ? "opacity-0"
            : `bg-sky-950/30 hover:${darkBlueBgHover} hover:text-white cursor-pointer`
        }`}
        onClick={month.selectCurrentMonth}
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
