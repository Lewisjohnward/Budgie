import { AssignState } from "../hooks/useAssign";
import {
  AssignLayout,
  AutoAssign,
  CategoryDetails,
  Notes,
  SelectedCategories,
} from ".";
import { AssignModal } from "./modals/AssignModal";

interface AssignProps {
  assign: AssignState;
}

export function Assign({ assign }: AssignProps) {
  const { selectedCategories, autoAssign, notes } = assign;

  return (
    <>
      <AssignLayout
        selectedCategories={
          selectedCategories.selectedCategories.length > 0 && (
            <SelectedCategories
              categories={selectedCategories.selectedCategories}
            />
          )
        }
        categoryDetails={<CategoryDetails {...selectedCategories} />}
        autoAssign={<AutoAssign {...autoAssign} />}
        notes={<Notes {...notes} />}
      />
      <AssignModal modalState={autoAssign.modal} />
    </>
  );
}
