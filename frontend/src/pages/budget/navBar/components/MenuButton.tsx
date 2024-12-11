import { forwardRef } from "react";
import clsx from "clsx";
import { selectCurrentUser } from "@/core/auth/authSlice";
import { BirdIcon, ChevronDownIcon } from "@/core/icons/icons";
import useMouseOver from "@/core/hooks/useMouseOver";
import { useAppSelector } from "@/core/hooks/reduxHooks";

type MenuBottonProps = {
  animate?: boolean;
  displayText: boolean;
};

export const MenuButton = forwardRef<HTMLButtonElement, MenuBottonProps>(
  ({ displayText, animate, ...props }, ref) => {
    const { mouseOver, handleMouseOver } = useMouseOver();
    const email = useAppSelector(selectCurrentUser);

    return (
      <button
        className="flex justify-between items-center gap-4 w-full h-14 px-2 rounded hover:bg-white/10"
        onMouseEnter={handleMouseOver}
        ref={ref}
        {...props}
      >
        <div className="flex-1 flex flex-row items-center gap-2">
          <BirdIcon
            className={clsx(
              animate || mouseOver ? "animate-shake" : "",
              "h-8 w-8",
            )}
            data-testid="icon"
          />
          {displayText && (
            <div
              className="flex-1 flex items-center space-between"
              data-testid="expanded-info"
            >
              <div className="flex-1 flex flex-col text-left">
                <p className="font-bold">budget</p>
                <p className="text-xs text-white/70">{email}</p>
              </div>
              <ChevronDownIcon />
            </div>
          )}
        </div>
      </button>
    );
  },
);
