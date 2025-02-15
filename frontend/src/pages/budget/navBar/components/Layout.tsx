import { ReactNode } from "react";
import { darkBlueBg } from "@/core/theme/colors";
import clsx from "clsx";

export function Layout({
  menu,
  items,
  toggleButton,
  accounts,
  open,
}: {
  menu: ReactNode;
  items: ReactNode;
  toggleButton: ReactNode;
  accounts: ReactNode;
  open: boolean;
}) {
  return (
    <div
      className={clsx(
        open ? "w-64" : "w-16",
        `flex flex-col justify-between gap-1 h-full py-4 px-2 caret-transparent ${darkBlueBg} text-white select-none transition-[width] duration-300`,
      )}
    >
      <div className="space-y-4 overflow-hidden">
        {menu}
        <div className="space-y-1">{items}</div>
        <div className="space-y-2">{accounts}</div>
      </div>

      <div
        className={clsx(
          open ? "pr-0" : "pr-2",
          "flex justify-end transition-[padding] duration-300",
        )}
      >
        {toggleButton}
      </div>
    </div>
  );
}
