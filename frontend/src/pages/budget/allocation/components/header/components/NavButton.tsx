import { darkBlueBgHover, darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";
import { ComponentProps, ReactNode } from "react";

interface NavButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
}

export function NavButton({ children, className, ...rest }: NavButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "rounded-xl w-6 h-6",
        {
          "opacity-50": rest.disabled,
          [`hover:${darkBlueBgHover} cursor-pointer`]: !rest.disabled,
        },
        className,
      )}
    >
      <div className={`${darkBlueText}`}>{children}</div>
    </button>
  );
}
