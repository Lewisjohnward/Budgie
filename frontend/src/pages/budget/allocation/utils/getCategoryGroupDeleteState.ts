import { CategoryMetricsById } from "../hooks/useAllocation/useAllocationIndexes";
import { CategoryGroupId, CategoryId } from "../types/types";

// Input
type GetCategoryGroupDeleteStatusParams = {
  categoryGroupId: CategoryGroupId;
  categoryIdsInGroup: CategoryId[];
  metrics: CategoryMetricsById;
};

// Output
export type CategoryGroupDeleteState = {
  categoryGroupId: CategoryGroupId;
  categoryCount: number;
  hasAssigned: boolean;
  transactionCount: number;
  canDelete: boolean;
};

export function getCategoryGroupDeleteState({
  categoryGroupId,
  categoryIdsInGroup,
  metrics,
}: GetCategoryGroupDeleteStatusParams): CategoryGroupDeleteState {
  let hasAssigned = false;
  let transactionCount = 0;

  for (const categoryId of categoryIdsInGroup) {
    const m = metrics[categoryId];
    if (!m) continue;

    if (m.hasAssigned) {
      hasAssigned = true;
    }

    transactionCount += m.transactionCount;
  }

  return {
    categoryGroupId: categoryGroupId,
    categoryCount: categoryIdsInGroup.length,
    hasAssigned,
    transactionCount,
    canDelete: !(hasAssigned || transactionCount > 0),
  };
}
