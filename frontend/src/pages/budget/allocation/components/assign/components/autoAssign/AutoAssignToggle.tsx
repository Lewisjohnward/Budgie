import { LightningIcon } from "@/core/icons/icons";
import { ChevronDownIcon } from "lucide-react";

interface AutoAssignToggleProps {
  open: boolean;
  toggleOpen: () => void;
}

export function AutoAssignToggle({ open, toggleOpen }: AutoAssignToggleProps) {
  return (
    <button
      className="flex w-full items-center justify-between px-3 py-2 border-b"
      onClick={toggleOpen}
      aria-expanded={open}
      aria-controls="auto-assign-content"
    >
      <span className="flex items-center gap-2">
        <LightningIcon />
        <span className="text-sm font-bold">Auto-Assign</span>
        <ChevronDownIcon
          className={`transition-transform duration-100 ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </span>
    </button>
  );
}
