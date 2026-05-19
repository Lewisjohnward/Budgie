import { cn } from "@/core/lib/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function CategoryGridRow({ children, className }: Props) {
  return (
    <div
      className={cn(
        "py-2 px-2 grid grid-cols-[30px_20fr_3fr_3fr_3fr] gap-x-2 border bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}
