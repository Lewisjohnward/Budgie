import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";

export const mergeCategoryGroups = (
  draftView: MappedCategoryGroupViewWithMetrics[],
  categoriesByGroup: MappedCategoryGroupViewWithMetrics[]
): MappedCategoryGroupViewWithMetrics[] => {
  const draftOrder = new Map(
    draftView.map((group, index) => [group.group.id, index])
  );

  return [...categoriesByGroup].sort(
    (a, b) =>
      (draftOrder.get(a.group.id) ?? Infinity) -
      (draftOrder.get(b.group.id) ?? Infinity)
  );
};
