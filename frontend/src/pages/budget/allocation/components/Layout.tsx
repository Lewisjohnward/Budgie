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
    <div className="flex flex-col h-full">
      {header}
      <div className="overflow-scroll flex h-full">
        <div className="min-w-[600px] xl:basis-4/6 overflow-scroll">
          {primary}
        </div>
        <div
          className={`hidden xl:flex flex-col basis-2/6 h-full p-4 bg-gray-200 overflow-y-scroll`}
        >
          {sidebar}
        </div>
      </div>
    </div>
  );
}
