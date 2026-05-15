import { ReactNode } from "react";

interface AssignLayoutProps {
  selectedCategories: ReactNode;
  categoryBreakdown: ReactNode;
  autoAssign: ReactNode;
  note: ReactNode;
}

export function AllocationPanelLayout({
  selectedCategories,
  categoryBreakdown,
  autoAssign,
  note,
}: AssignLayoutProps) {
  return (
    <div className={`space-y-2`}>
      {selectedCategories}
      {categoryBreakdown}
      {autoAssign}
      {note}
    </div>
  );
}
