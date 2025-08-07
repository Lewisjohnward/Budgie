import { ReactNode } from "react";
import { borderBottom } from "@/core/theme/colors";

interface HeaderLayoutProps {
  monthSelector: ReactNode;
  readyToAssign: ReactNode;
  categoryFilters: ReactNode;
}

export function HeaderLayout({ monthSelector, readyToAssign, categoryFilters }: HeaderLayoutProps) {
  return (
    <div className={`px-4 py-2 border-b ${borderBottom}`}>
      <div className="flex gap-16 py-4">
        <div className="flex gap-4 items-center">
          {monthSelector}
        </div>
        <div className="hidden md:block">
          {readyToAssign}
        </div>
      </div>
      <div className="gap-2 hidden md:flex">
        {categoryFilters}
      </div>
    </div>
  );
}
