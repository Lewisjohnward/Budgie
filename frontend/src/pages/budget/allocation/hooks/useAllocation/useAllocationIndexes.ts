import {
  CategoryBranded,
  MonthBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import { useMemo } from "react";
import {
  MonthKey,
  CategoryMonthMap,
  CategoryId,
  MonthId,
  TransactionId,
} from "../../types/types";
import { buildMonthsByDate } from "../../utils/buildMonthsByDate";
import { resolveMonthMap } from "./useCategories";
import { pickUserCategoryMonths } from "../../utils/pickUserCategoryMonths";
import { resolvePreviousYearMonthMaps } from "../../utils/resolvePreviousYearMonthMaps";

// Input
type UseAllocationParams = {
  months: Record<MonthId, MonthBranded>;
  monthKeys: MonthKey[];
  monthIndex: number;
  userCategories: Record<CategoryId, CategoryBranded>;
  transactions: Record<TransactionId, TransactionBranded>;
};

// Output
type AllocationIndexes = {
  monthsByDate: Record<MonthKey, CategoryMonthMap>;
  currentMonthKey: MonthKey;
  previousMonthKey: MonthKey | null;

  currentCategoryMonthMap: Record<CategoryId, MonthBranded>;
  previousCategoryMonthMap: Record<CategoryId, MonthBranded> | null;

  currentUserCategoryMonthMap: Record<CategoryId, MonthBranded>;
  previousUserCategoryMonthMap: Record<CategoryId, MonthBranded> | null;

  currentUserMonths: MonthBranded[];
  previousUserMonths: MonthBranded[];
  previousYearUserMonths: MonthBranded[];
  categoryMetricsById: CategoryMetricsById;
};

export type CategoryMetricsById = Record<
  CategoryId,
  {
    name: string;
    transactionCount: number;
    hasAssigned: boolean;
    assignedTotal: number;
    available: number;
  }
>;

export function useAllocationIndexes({
  months,
  monthKeys,
  monthIndex,
  userCategories,
  transactions,
}: UseAllocationParams): AllocationIndexes {
  const currentMonthKey = monthKeys[monthIndex];
  const previousMonthKey = monthIndex > 0 ? monthKeys[monthIndex - 1] : null;

  const monthsByDate = useMemo(() => {
    return buildMonthsByDate(months, monthKeys);
  }, [months, monthKeys]);

  const currentCategoryMonthMap = useMemo(() => {
    return resolveMonthMap(monthsByDate, currentMonthKey);
  }, [monthsByDate, currentMonthKey]);

  const previousCategoryMonthMap = useMemo(() => {
    return previousMonthKey
      ? resolveMonthMap(monthsByDate, previousMonthKey)
      : null;
  }, [monthsByDate, previousMonthKey]);

  const currentUserCategoryMonthMap = useMemo(() => {
    return pickUserCategoryMonths(currentCategoryMonthMap, userCategories);
  }, [currentCategoryMonthMap, userCategories]);

  const previousUserCategoryMonthMap = useMemo(() => {
    return previousCategoryMonthMap
      ? pickUserCategoryMonths(previousCategoryMonthMap, userCategories)
      : null;
  }, [previousCategoryMonthMap, userCategories]);

  const userCategoryIds = useMemo(() => {
    return new Set(Object.keys(userCategories) as CategoryId[]);
  }, [userCategories]);

  const previousYearUserMonths = useMemo(() => {
    const previousYearMaps = resolvePreviousYearMonthMaps(
      monthsByDate,
      monthKeys,
      monthIndex
    );

    return previousYearMaps
      .flatMap((map) => Object.values(map))
      .filter((m) => userCategoryIds.has(m.categoryId));
  }, [monthsByDate, monthKeys, monthIndex, userCategoryIds]);

  const currentUserMonths = useMemo(() => {
    return Object.values(currentUserCategoryMonthMap);
  }, [currentUserCategoryMonthMap]);

  const previousUserMonths = useMemo(() => {
    return previousUserCategoryMonthMap
      ? Object.values(previousUserCategoryMonthMap)
      : [];
  }, [previousUserCategoryMonthMap]);

  const categoryMetricsById = useMemo(() => {
    const metrics: CategoryMetricsById = {};

    // Init from categories
    for (const categoryId of Object.keys(userCategories) as CategoryId[]) {
      metrics[categoryId] = {
        name: userCategories[categoryId].name,
        transactionCount: 0,
        hasAssigned: false,
        assignedTotal: 0,
        available: currentUserCategoryMonthMap[categoryId].available,
      };
    }

    // Transactions → transactionCount
    for (const tx of Object.values(transactions)) {
      if (!tx.categoryId) continue;

      const entry = metrics[tx.categoryId];
      if (!entry) continue;

      entry.transactionCount += 1;
    }

    // Months → assigned + hasAssigned
    for (const month of Object.values(months)) {
      const categoryId = month.categoryId;

      const entry = metrics[categoryId];
      if (!entry) continue;

      entry.assignedTotal += month.assigned;

      if (month.assigned > 0) {
        entry.hasAssigned = true;
      }
    }

    return metrics;
  }, [months, transactions, userCategories]);

  return {
    // TODO:(lewis 2026-05-16 11:19) no one is using this
    monthsByDate,
    currentMonthKey,
    previousMonthKey,

    currentCategoryMonthMap,
    previousCategoryMonthMap,

    currentUserCategoryMonthMap,
    previousUserCategoryMonthMap,

    currentUserMonths,
    previousUserMonths,
    previousYearUserMonths,

    categoryMetricsById,
  };
}
