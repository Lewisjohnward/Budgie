import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { AllocationData } from "@/core/types/Allocation";
import { CategoryMonthMap, MonthKey } from "../../types/types";
import { useGetBudgetSnapshotQuery } from "@/core/api/budget/budgetSnapshotSlice";

// this is currently used in reflect it will need removing
export const useCategoriesData = () => {
  const { data } = useGetCategoriesQuery();
  if (!data) {
    return {
      categoryGroups: {},
      categories: {},
      months: {},
    } as AllocationData;
  }
  return data;
};

export function resolveMonthMap(
  monthsByDate: Record<MonthKey, CategoryMonthMap>,
  monthKey: MonthKey
): CategoryMonthMap {
  const bucket = monthsByDate[monthKey];

  if (!bucket) {
    throw new Error(`Missing bucket for monthKey ${monthKey}`);
  }

  return bucket;
}

/**
 * Provides access to the bootstrapped application data.
 *
 * This hook wraps the RTK Query `useGetBootstrapQuery` hook and enforces
 * the invariant that bootstrap data must be available before usage.
 *
 * It is expected that loading and error states are handled higher up
 * in the component tree (e.g. a layout or route guard). If this hook
 * is called before the data is ready, it will throw.
 * NOTE:
 * This hook assumes a parent component has already handled:
 * - loading state
 * - error state
 *
 * It should only be used in components that are guaranteed to render
 * after bootstrap data has been successfully fetched.
 *
 * @returns An object containing the fully loaded and transformed bootstrap data
 *
 * @throws If the bootstrap data has not yet been loaded
 */
export function useBudgetSnapshot() {
  const { data } = useGetBudgetSnapshotQuery();

  if (!data) {
    throw new Error("Bootstrap not ready");
  }

  return { data };
}
