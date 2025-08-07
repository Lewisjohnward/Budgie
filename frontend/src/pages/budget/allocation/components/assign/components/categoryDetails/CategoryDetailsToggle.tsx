import { ChevronDownIcon } from "lucide-react";
import { Available } from "../../../categories/components";

export interface CategoryDetailsToggleProps {
  toggleOpen: () => void;
  open: boolean;
  currentMonthName: string;
  hasSelectedCategories: boolean;
  available: number;
}

export function CategoryDetailsToggle({
  toggleOpen,
  open,
  currentMonthName,
  hasSelectedCategories,
  available,
}: CategoryDetailsToggleProps) {
  const buttonLabel = hasSelectedCategories
    ? "Available Balance"
    : `${currentMonthName}'s Balance`;

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
      {hasSelectedCategories && <Available value={available} />}
    </button>
  );
}
