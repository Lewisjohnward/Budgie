import { CategoryMetricsById } from "../hooks/useAllocation/useAllocationIndexes";
import { CategoryId } from "../types/types";

// Input
type GetCategoryGroupDeleteStatusParams = {
  categoryIdsInGroup: CategoryId[];
  metrics: CategoryMetricsById;
};

// Output
export type CategoryGroupDeleteState = {
  categoryCount: number;
  hasAssigned: boolean;
  transactionCount: number;
  canDelete: boolean;
};

export function getCategoryGroupDeleteState({
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
    categoryCount: categoryIdsInGroup.length,
    hasAssigned,
    transactionCount,
    canDelete: !(hasAssigned || transactionCount > 0),
  };
}
// groups: {
//   name: string;
//   categories: {
//     name: string;
//     available: number;
//   }[];
// }[];
