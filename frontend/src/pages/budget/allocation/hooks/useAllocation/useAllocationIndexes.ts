import { CategoryBranded, MonthBranded } from "@/core/types/NormalizedData";
import { useMemo } from "react";
import {
  MonthKey,
  CategoryMonthMap,
  CategoryId,
  MonthId,
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
};

export function useAllocationIndexes(
  params: UseAllocationParams
): AllocationIndexes {
  const { months, monthKeys, monthIndex, userCategories } = params;

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
  };
}
