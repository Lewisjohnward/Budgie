import { CategoryGroupId } from "../types/types";
import { CategoryGroupsWithMetricsParams } from "./buildCategoryGroupMetrics";
import { CategoryViewRow } from "./buildCategoryViewModel";

// Input
type AssembleCategoryGroupViewParams = {
  categoryGroupViews: CategoryGroupViewInput[];
  categoryGroupMetrics: CategoryGroupsWithMetricsParams;
};

type CategoryGroupViewInput = {
  group: {
    id: CategoryGroupId;
    name: string;
    position: number;
  };
  rows: CategoryViewRow[];
};

// Output
export type CategoryGroupViewWithMetrics = {
  group: CategoryGroupWithMetrics;
  rows: CategoryViewRow[];
};

export type CategoryGroupWithMetrics = {
  id: CategoryGroupId;
  name: string;
  position: number;
  assigned: number;
  activity: number;
  available: number;
};

export function assembleCategoryGroupViews(
  params: AssembleCategoryGroupViewParams
): CategoryGroupViewWithMetrics[] {
  const { categoryGroupViews, categoryGroupMetrics } = params;

  return categoryGroupViews.map((groupView) => {
    const metrics = categoryGroupMetrics[groupView.group.id];

    if (!metrics) {
      throw new Error(
        `Missing metrics for category group ${groupView.group.id}`
      );
    }

    return {
      ...groupView,
      group: {
        ...groupView.group,
        assigned: metrics.assigned,
        activity: metrics.activity,
        available: metrics.available,
      },
    };
  });
}
