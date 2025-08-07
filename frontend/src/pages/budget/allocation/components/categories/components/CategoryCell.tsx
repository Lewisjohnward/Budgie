import { ReactNode } from "react";

export function CategoryCell({ children }: { children: ReactNode }) {
  return <div className="px-1 text-right whitespace-nowrap">{children}</div>;
}
