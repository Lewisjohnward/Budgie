import { ChevronDownIcon } from "lucide-react";
import { Available } from "../../../categories/components";
import { ViewMode } from "@/pages/budget/allocation/hooks/useAllocation/useCategoryBreakdown";

export type CategoryDetailsToggleProps = {
  toggleOpen: () => void;
  open: boolean;
  currentMonthName: string;
  available: number;
  view: ViewMode;
};

export function CategoryDetailsToggle({
  toggleOpen,
  open,
  currentMonthName,
  available,
  view,
}: CategoryDetailsToggleProps) {
  const multipleView = view === "multiple";

  const buttonLabel = multipleView
    ? `${currentMonthName}'s Balance`
    : "Available Balance";

  return (
    <button
      className="flex w-full items-center justify-between px-3 py-2 border-b"
      onClick={toggleOpen}
      aria-expanded={open}
      aria-controls="category-details"
    >
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold">{buttonLabel}</span>
        <ChevronDownIcon
          className={`transition-transform duration-100 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </span>
      {!multipleView && <Available value={available} />}
    </button>
  );
}
