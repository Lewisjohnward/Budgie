import clsx from "clsx";
import { forwardRef } from "react";
import { BirdIcon, ChevronDownIcon } from "@/core/icons/icons";
import useMouseOver from "@/core/hooks/useMouseOver";

type MenuBottonProps = {
  animate: boolean;
  displayText: boolean;
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuBottonProps>(
  ({ displayText, animate, ...props }, ref) => {
    const { mouseOver, handleMouseOver } = useMouseOver();

    return (
      <button
        className="flex justify-between items-center gap-4 w-full h-14 px-2 rounded hover:bg-white/10"
        onMouseEnter={handleMouseOver}
        ref={ref}
        {...props}
      >
        <div className="flex flex-row items-center gap-2">
          <BirdIcon
            className={clsx(
              animate || mouseOver ? "animate-shake" : "",
              "h-8 w-8",
            )}
          />
          {displayText && (
            <div>
              <p className="text-left font-bold">budget</p>
              <p className="text-xs text-white/70">placeholder@email.com</p>
            </div>
          )}
        </div>
        {displayText && <ChevronDownIcon />}
      </button>
    );
  },
);
