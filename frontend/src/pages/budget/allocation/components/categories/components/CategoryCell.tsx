import { ReactNode } from "react";

type CategoryCellProps = {
  children: ReactNode;
  ariaLabel?: string;
};

export function CategoryCell({ children, ariaLabel }: CategoryCellProps) {
  return (
    <div
      role="gridcell"
      aria-label={ariaLabel}
      className="px-1 text-right whitespace-nowrap"
    >
      {children}
    </div>
  );
}
