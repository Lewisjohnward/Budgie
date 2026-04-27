import { darkBlueBgHover } from "@/core/theme/colors";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { NavButton } from "./NavButton";
import clsx from "clsx";
import { MonthSelectorHook } from "../../../hooks/useMonthSelector";

export function MonthSelector({
  monthSelector,
}: {
  monthSelector: MonthSelectorHook;
}) {
  return (
    <>
      <div className="flex items-center gap-1">
        <NavButton
          onClick={monthSelector.prev}
          disabled={!monthSelector.canGoPrev}
          aria-label="previous month"
        >
          <ArrowLeftIcon />
        </NavButton>
        <p className="w-24 text-center text-xl font-semibold">
          {monthSelector.currentMonthNameFormatLong}
        </p>
        <NavButton
          onClick={monthSelector.next}
          disabled={!monthSelector.canGoNext}
          aria-label="next month"
        >
          <ArrowRightIcon />
        </NavButton>
      </div>
      <button
        disabled={monthSelector.isCurrentMonth}
        className={clsx("px-2 py-1 rounded", {
          "opacity-0": monthSelector.isCurrentMonth,
          [`bg-sky-950/30 hover:${darkBlueBgHover} hover:text-white cursor-pointer`]:
            !monthSelector.isCurrentMonth,
        })}
        onClick={monthSelector.selectCurrentMonth}
      >
        Today
      </button>
    </>
  );
}
