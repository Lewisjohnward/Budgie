import { ChevronDownIcon } from "@/core/icons/icons";
import clsx from "clsx";

interface ExpandButtonProps {
  open: boolean;
  onClick: () => void;
  "aria-label"?: string;
}

export function ExpandButton({
  open,
  onClick,
  "aria-label": ariaLabel,
}: ExpandButtonProps) {
  return (
    <button onClick={onClick} aria-label={ariaLabel}>
      <ChevronDownIcon
        className={clsx(
          "m-auto text-sky-950 transition-transform duration-100",
          open ? "rotate-0" : "-rotate-90",
        )}
      />
    </button>
  );
}
