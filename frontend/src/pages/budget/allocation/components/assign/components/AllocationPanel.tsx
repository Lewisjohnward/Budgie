import { AutoAssign, CategoryBreakdown, Note, SelectedCategories } from ".";
import { AllocationPanelLayout } from "./AllocationPanelLayout";
import { CategoryBreakdownViewModel } from "../../../hooks/useAllocation/useCategoryBreakdown";
import { AutoAssignViewModel } from "../../../hooks/useAllocation/useAutoAssign";
import { CategoryBranded } from "@/core/types/NormalizedData";
import { NoteViewModel } from "../hooks/useNoteViewModel";

type AllocationPanelProps = {
  selectedCategories: CategoryBranded[];
  categoryBreakDownViewModel: CategoryBreakdownViewModel;
  autoAssignViewModel: AutoAssignViewModel;
  noteViewModel: NoteViewModel;
};

export function AllocationPanel({
  selectedCategories,
  categoryBreakDownViewModel,
  autoAssignViewModel,
  noteViewModel,
}: AllocationPanelProps) {
  const areCategoriesSelected =
    categoryBreakDownViewModel.hasSelectedCategories;

  return (
    <>
      <AllocationPanelLayout
        selectedCategories={
          areCategoriesSelected && (
            <SelectedCategories
              selectedCategories={selectedCategories}
              view={categoryBreakDownViewModel.view}
            />
          )
        }
        categoryBreakdown={
          <CategoryBreakdown
            categoryBreakdownViewModel={categoryBreakDownViewModel}
          />
        }
        autoAssign={<AutoAssign autoAssignViewModel={autoAssignViewModel} />}
        note={<Note noteViewModel={noteViewModel} />}
      />
    </>
  );
}
