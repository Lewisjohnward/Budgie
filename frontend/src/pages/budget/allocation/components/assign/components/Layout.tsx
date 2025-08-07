import { ReactNode } from "react";

interface AssignLayoutProps {
  selectedCategories: ReactNode;
  categoryDetails: ReactNode;
  autoAssign: ReactNode;
  notes: ReactNode;
}

export function AssignLayout({
  selectedCategories,
  categoryDetails,
  autoAssign,
  notes,
}: AssignLayoutProps) {
  return (
    <div className={`space-y-2`}>
      {selectedCategories}
      {categoryDetails}
      {autoAssign}
      {notes}
    </div>
  );
}
