import { ReactNode } from "react";

interface AllocationLayoutProps {
  header: ReactNode;
  primary: ReactNode;
  sidebar: ReactNode;
}

export function AllocationLayout({
  header,
  primary,
  sidebar,
}: AllocationLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {header}
      <div className="flex flex-1 min-h-0">
        <div className="flex min-h-0 flex-[2_1_0%] border-r border-r-gray-300">
          {primary}
        </div>
        <div className="hidden xl:flex flex-col flex-[1_1_0%] min-h-0 p-4 bg-gray-100 overflow-y-auto">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
