import { ReactNode } from "react";

interface AssignLayoutProps {
  selectedCategories: ReactNode;
  categoryBreakdown: ReactNode;
  autoAssign: ReactNode;
  notes: ReactNode;
}

export function AllocationPanelLayout({
  selectedCategories,
  categoryBreakdown,
  autoAssign,
  notes,
}: AssignLayoutProps) {
  return (
    <div className={`space-y-2`}>
      {selectedCategories}
      {categoryBreakdown}
      {autoAssign}
      {notes}
    </div>
  );
}
