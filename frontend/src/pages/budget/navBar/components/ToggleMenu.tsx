import { ArrowIcon } from "@/core/icons/icons";
import clsx from "clsx";

export function ToggleMenu({
  open,
  toggle: toggleOpen,
}: {
  open: boolean;
  toggle: () => void;
}) {
  return (
    <button
      className={clsx(
        open ? "rotate-0" : "rotate-180",
        "max-w-fit transition-transform duration-300",
      )}
      onClick={toggleOpen}
    >
      <ArrowIcon className="w-8 h-8 text-white/80 hover:text-white" />
    </button>
  );
}
