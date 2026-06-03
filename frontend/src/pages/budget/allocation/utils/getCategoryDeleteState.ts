import { CategoryMetricsById } from "../hooks/useAllocation/useAllocationIndexes";
import { CategoryId } from "../types/types";

export function getCategoryDeleteState(params: {
  categoryId: CategoryId;
  metrics: CategoryMetricsById;
}) {
  const m = params.metrics[params.categoryId];

  return {
    hasAssigned: m?.hasAssigned ?? false,
    hasTransactions: (m?.transactionCount ?? 0) > 0,
    canDelete: !(m?.hasAssigned || (m?.transactionCount ?? 0) > 0),
  };
}
