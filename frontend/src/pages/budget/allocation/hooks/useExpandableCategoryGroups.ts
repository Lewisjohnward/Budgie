import {
  MappedAllocationData,
  MappedCategoryGroup,
} from "@/core/types/Allocation";
import { produce } from "immer";

export function useExpandableCategoryGroups(
  categoryGroups: MappedCategoryGroup[],
  setAllocationData: React.Dispatch<React.SetStateAction<MappedAllocationData>>,
) {
  const atLeastOneOpen = categoryGroups.some((group) => group.open);

  const expandAll = () => {
    setAllocationData((prev) =>
      produce(prev, (draft) => {
        Object.values(draft.categoryGroups).forEach((group) => {
          group.open = !atLeastOneOpen;
        });
      }),
    );
  };

  const expandOne = (groupId: string) => {
    setAllocationData((prev) =>
      produce(prev, (draft) => {
        draft.categoryGroups[groupId].open =
          !draft.categoryGroups[groupId].open;
      }),
    );
  };

  return {
    atLeastOneGroupOpen: atLeastOneOpen,
    expandAllCategoryGroups: expandAll,
    expandCategoryGroup: expandOne,
  };
}
