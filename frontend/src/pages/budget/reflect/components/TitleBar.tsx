import { useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import clsx from "clsx";
import { usePopover } from "@/core/hooks/usePopover";
import { DATE_RANGE_OPTIONS } from "../constants/dateRanges";
import type { TitleBarState } from "../hooks/useSpendingData";

// TODO:(lewis 2025-11-24 17:26) i think this is used somewhere else, abstract?
const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export function TitleBar({ titleBarState }: { titleBarState: TitleBarState }) {
  const monthPopover = usePopover();
  const [isCustomMonthRange, setIsCustomMonthRange] = useState(false);

  const openCustomMonthRange = () => setIsCustomMonthRange(true);

  const { title, monthState } = titleBarState;

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold">{title}</p>
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-0">
          {/* selector button */}

          <button
            onClick={monthState.handlePrevPeriod}
            disabled={monthState.monthIndex === 0}
            className="relative p-2 bg-white text-sky-700 font-[500] rounded-bl-md rounded-tl-md hover:bg-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed before:content-[''] before:absolute before:right-0 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200"
          >
            <ChevronLeft size={16} />
          </button>

          <Popover open={monthPopover.isOpen} modal={true}>
            <PopoverTrigger>
              <button
                onClick={monthPopover.open}
                className={clsx(
                  "flex items-center justify-center gap-2 min-w-[120px] h-8 px-2 text-sky-700 bg-white text-sm font-[400] text-center hover:bg-blue-600/10"
                )}
              >
                <Calendar size={15} />
                {monthState.selectedDateRange === "This month"
                  ? monthState.currentMonthDate
                    ? formatMonth(monthState.currentMonthDate)
                    : "No data"
                  : monthState.startMonthDate && monthState.endMonthDate
                  ? `${formatMonth(monthState.startMonthDate)} - ${formatMonth(monthState.endMonthDate)}`
                  : "No data"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              onEscapeKeyDown={monthPopover.close}
              onPointerDownOutside={monthPopover.close}
              onFocusOutside={(e) => e.preventDefault()}
              className="flex flex-col w-[250px] py-2 px-1 space-y-1 shadow-xl border-0 border-gray-400/20 text-nowrap"
              align={"center"}
            >
              <PopoverArrow className="w-6 h-3 fill-white" />
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    monthPopover.close();
                    monthState.setSelectedDateRange(option);
                  }}
                  className={clsx(
                    "flex justify-between items-center px-2 py-1 text-[0.9rem] text-start rounded hover:bg-stone-100",
                    monthState.selectedDateRange === option && "text-sky-500"
                  )}
                >
                  {option}
                  {monthState.selectedDateRange === option ? (
                    <Check size={15} />
                  ) : null}
                </button>
              ))}
              <div className="h-[1px] mx-4 bg-stone-200"></div>
              <button
                onClick={openCustomMonthRange}
                className="px-2 py-1 text-[0.9rem] text-start rounded hover:bg-stone-100"
              >
                Custom
              </button>
              {isCustomMonthRange ? (
                <>
                  <p>start date</p>
                  <p>end date</p>
                  <button>cancel</button>
                  <button>apply</button>
                </>
              ) : null}
            </PopoverContent>
          </Popover>

          {/* selector button */}
          <button
            onClick={monthState.handleNextPeriod}
            // disabled={monthSelector.monthIndex === uniqueMonths.length - 1}
            className="relative p-2 bg-white text-sky-700 font-[500] rounded-br-md rounded-tr-md hover:bg-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
