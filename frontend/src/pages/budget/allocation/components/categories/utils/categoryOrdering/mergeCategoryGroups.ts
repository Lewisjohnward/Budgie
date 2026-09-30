import { MappedCategoryGroupViewWithMetrics } from "@/pages/budget/allocation/hooks/useAllocation/useExpandableCategoryGroups";

export const mergeCategoryGroups = (
  draftView: MappedCategoryGroupViewWithMetrics[],
  categoriesByGroup: MappedCategoryGroupViewWithMetrics[]
): MappedCategoryGroupViewWithMetrics[] => {
  const draftGroups = new Map(
    draftView.map((group) => [group.group.id, group])
  );

  const draftGroupOrder = new Map(
    draftView.map((group, index) => [group.group.id, index])
  );

  const serverRows = new Map(
    categoriesByGroup.flatMap((group) =>
      group.rows.map((row) => [row.category.id, row])
    )
  );

  const draftCategoryIds = new Set(
    draftView.flatMap((group) => group.rows.map((row) => row.category.id))
  );

  return [...categoriesByGroup]
    .map((group) => {
      const draftGroup = draftGroups.get(group.group.id);

      if (!draftGroup) {
        return group;
      }

      const rows = draftGroup.rows
        .filter((row) => serverRows.has(row.category.id))
        .map((row) => serverRows.get(row.category.id)!);

      const newRows = group.rows.filter(
        (row) => !draftCategoryIds.has(row.category.id)
      );

      return {
        ...group,
        rows: [...rows, ...newRows],
      };
    })
    .sort(
      (a, b) =>
        (draftGroupOrder.get(a.group.id) ?? Infinity) -
        (draftGroupOrder.get(b.group.id) ?? Infinity)
    );
};
