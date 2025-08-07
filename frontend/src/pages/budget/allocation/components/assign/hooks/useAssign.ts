import { useSelectedCategories } from "./useSelectedCategories";
import { useAutoAssign } from "./useAutoAssign";
import { useNotes } from "./useNotes";

export function useAssign() {
  const selectedCategories = useSelectedCategories();
  const autoAssign = useAutoAssign();
  const notes = useNotes();

  return {
    selectedCategories,
    autoAssign,
    notes,
  };
}

export type AssignState = ReturnType<typeof useAssign>;
