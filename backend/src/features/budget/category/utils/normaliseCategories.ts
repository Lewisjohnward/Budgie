import {
  CategoryGroupWithCategoriesAndMonths,
  Memo,
  NormalisedCategoryData,
  NormalisedData,
} from "../category.types";
import { convertDecimalToNumber } from "../../../../shared/utils/convertDecimalToNumber";

export function normaliseCategories(
  categoryGroups: CategoryGroupWithCategoriesAndMonths[],
  memos: Memo[]
): NormalisedData {
  const normalisedData = categoryGroups.reduce(
    (acc, categoryGroup) => {
      acc.categoryGroups[categoryGroup.id] = {
        id: categoryGroup.id,
        name: categoryGroup.name,
        position: categoryGroup.position,

        categories: categoryGroup.categories.map((cat) => cat.id),
      };
      categoryGroup.categories.forEach((cat) => {
        acc.categories[cat.id] = {
          id: cat.id,
          userId: cat.userId,
          categoryGroupId: cat.categoryGroupId,
          name: cat.name,
          months: cat.months.map((month) => month.id),
          position: cat.position,
        };

        cat.months.forEach((month) => {
          acc.months[month.id] = {
            id: month.id,
            categoryId: cat.id,
            month: month.month.toISOString(),
            activity: convertDecimalToNumber(month.activity),
            assigned: convertDecimalToNumber(month.assigned),
            available: convertDecimalToNumber(month.available),
          };
        });
      });

      return acc;
    },
    {
      categoryGroups: {},
      categories: {},
      months: {},
    } as NormalisedCategoryData
  );

  const monthKeys = [
    ...new Set(
      Object.values(normalisedData.months).map((m) => m.month.slice(0, 7))
    ),
  ].sort();

  const memoByMonth: Record<
    string,
    { id: string; month: string; content: string }
  > = {};

  for (const key of monthKeys) {
    const memo = memos.find((m) => m.month.toISOString().slice(0, 7) === key);

    if (!memo) {
      // This should not happen if backend invariants are correct
      // but leaving this undefined makes bugs obvious
      continue;
    }

    memoByMonth[key] = {
      id: memo.id,
      month: memo.month.toISOString(),
      content: memo.content,
    };
  }

  return { ...normalisedData, monthKeys, memoByMonth };
}
