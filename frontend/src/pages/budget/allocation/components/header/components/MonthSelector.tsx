import { darkBlueBgHover } from "@/core/theme/colors";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { NavButton } from "./NavButton";
import { MonthSelectorViewModel } from "../../../hooks/useMonthSelector";

type MonthSelectorProps = {
  monthSelectorViewModel: MonthSelectorViewModel;
};

export function MonthSelector({
  monthSelectorViewModel: { current, navigation },
}: MonthSelectorProps) {
  return (
    <>
      <div className="flex items-center gap-1">
        <NavButton
          onClick={navigation.prev}
          disabled={!navigation.canGoPrev}
          aria-label="Previous month"
        >
          <ArrowLeftIcon />
        </NavButton>
        <time
          aria-label="Current displayed month"
          className="w-24 text-center text-xl font-semibold"
        >
          {current.labelLong}
        </time>
        <NavButton
          onClick={navigation.next}
          disabled={!navigation.canGoNext}
          aria-label="Next month"
        >
          <ArrowRightIcon />
        </NavButton>
      </div>
      <div className="w-20">
        {!current.isCurrent && (
          <button
            aria-label="Go to today"
            className={`px-2 py-1 rounded bg-sky-950/30 hover:${darkBlueBgHover} hover:text-white cursor-pointer`}
            onClick={navigation.selectCurrent}
          >
            Today
          </button>
        )}
      </div>
    </>
  );
}
