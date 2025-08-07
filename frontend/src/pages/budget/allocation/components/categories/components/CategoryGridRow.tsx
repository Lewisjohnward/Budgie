import { ReactNode } from "react";

export function CategoryGridRow({ children }: { children: ReactNode }) {
  return (
    <div className="py-2 px-2 grid grid-cols-[30px_20fr_3fr_3fr_3fr] gap-x-2 border-t">
      {children}
    </div>
  );
}
