import { CategoryMetricsById } from "../hooks/useAllocation/useAllocationIndexes";
import { CategoryId } from "../types/types";

// Input
type GetCategoryDeleteStateParams = {
  categoryId: CategoryId;
  metrics: CategoryMetricsById;
};

// Output
export type CategoryDeleteState = {
  categoryId: CategoryId;
  hasAssigned: boolean;
  transactionCount: number;
  canDelete: boolean;
};
export function getCategoryDeleteState({
  categoryId,
  metrics,
}: GetCategoryDeleteStateParams): CategoryDeleteState {
  const m = metrics[categoryId];

  return {
    categoryId: categoryId,
    hasAssigned: m?.hasAssigned ?? false,
    transactionCount: m?.transactionCount ?? 0,
    canDelete: !(m?.hasAssigned || (m?.transactionCount ?? 0) > 0),
  };
}
