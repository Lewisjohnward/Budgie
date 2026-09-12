import { AutoAssign, CategoryBreakdown, Note, SelectedCategories } from ".";
import { AllocationPanelLayout } from "./AllocationPanelLayout";
import { CategoryBreakdownViewModel } from "../../../hooks/useAllocation/useCategoryBreakdown";
import { AutoAssignViewModel } from "../../../hooks/useAllocation/useAutoAssign";
import { NoteViewModel } from "../hooks/useNoteViewModel";
import { CategoryActionTarget } from "../../../hooks/useAllocation/useAllocation";
import { SelectableCategory } from "../../../slices/selectedCategorySlice";

type AllocationPanelProps = {
  selectedCategories: SelectableCategory[];
  categoryBreakDownViewModel: CategoryBreakdownViewModel;
  autoAssignViewModel: AutoAssignViewModel;
  noteViewModel: NoteViewModel;
  onEditCategory: (e: React.MouseEvent, target: CategoryActionTarget) => void;
};

export function AllocationPanel({
  selectedCategories,
  categoryBreakDownViewModel,
  autoAssignViewModel,
  noteViewModel,
  onEditCategory,
}: AllocationPanelProps) {
  const areCategoriesSelected =
    categoryBreakDownViewModel.hasSelectedCategories;

  return (
    <>
      <AllocationPanelLayout
        selectedCategories={
          areCategoriesSelected && (
            <SelectedCategories
              onEditCategory={onEditCategory}
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
