import { darkBlueBgHover } from "@/core/theme/colors";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { NavButton } from "./NavButton";
import clsx from "clsx";
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
          aria-label="previous month"
        >
          <ArrowLeftIcon />
        </NavButton>
        <p className="w-24 text-center text-xl font-semibold">
          {current.labelLong}
        </p>
        <NavButton
          onClick={navigation.next}
          disabled={!navigation.canGoNext}
          aria-label="next month"
        >
          <ArrowRightIcon />
        </NavButton>
      </div>
      <button
        disabled={current.isCurrent}
        className={clsx("px-2 py-1 rounded", {
          "opacity-0": current.isCurrent,
          [`bg-sky-950/30 hover:${darkBlueBgHover} hover:text-white cursor-pointer`]:
            !current.isCurrent,
        })}
        onClick={navigation.selectCurrent}
      >
        Today
      </button>
    </>
  );
}
