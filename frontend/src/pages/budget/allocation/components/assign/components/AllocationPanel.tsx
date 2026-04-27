import { AutoAssign, CategoryBreakdown, Notes, SelectedCategories } from ".";
import { AssignModal } from "./modals/AssignModal";
import { AllocationPanelLayout } from "./AllocationPanelLayout";

interface AssignProps {
  categoryBreakDown: any;
  autoAssign: any;
  notes: any;
}

export function AllocationPanel({
  categoryBreakDown,
  autoAssign,
  notes,
}: AssignProps) {
  return (
    <>
      <AllocationPanelLayout
        selectedCategories={
          categoryBreakDown.hasSelectedCategories && (
            <SelectedCategories categories={categoryBreakDown} />
          )
        }
        categoryBreakdown={<CategoryBreakdown {...categoryBreakDown} />}
        autoAssign={<AutoAssign autoAssign={autoAssign} />}
        notes={<Notes {...notes} />}
      />
      <AssignModal modalState={autoAssign.modal} />
    </>
  );
}
