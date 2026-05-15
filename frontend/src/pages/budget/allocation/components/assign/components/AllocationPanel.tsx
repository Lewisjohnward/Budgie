import { AutoAssign, CategoryBreakdown, Note, SelectedCategories } from ".";
import { AssignModal } from "./modals/AssignModal";
import { AllocationPanelLayout } from "./AllocationPanelLayout";
import { CategoryBreakdownState } from "../../../hooks/useAllocation/useCategoryBreakdown";

interface AssignProps {
  categoryBreakDown: CategoryBreakdownState;
  autoAssign: any;
  note: any;
  selectedCategories: any;
}

export function AllocationPanel({
  categoryBreakDown,
  autoAssign,
  note,
  selectedCategories,
}: AssignProps) {
  return (
    <>
      <AllocationPanelLayout
        selectedCategories={
          categoryBreakDown.hasSelectedCategories && (
            <SelectedCategories selectedCategories={selectedCategories} />
          )
        }
        categoryBreakdown={<CategoryBreakdown {...categoryBreakDown} />}
        autoAssign={<AutoAssign autoAssign={autoAssign} />}
        note={<Note {...note} />}
      />
      <AssignModal modalState={autoAssign.modal} />
    </>
  );
}
