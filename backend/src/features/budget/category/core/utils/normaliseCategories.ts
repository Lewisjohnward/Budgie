import {
  asCategoryId,
  asMonthId,
  db,
  type MemoByMonth,
  type NormalisedCategoryData,
  type NormalisedData,
} from "../category.types";
import { convertDecimalToNumber } from "../../../../../shared/utils/convertDecimalToNumber";
import { asCategoryGroupId } from "../../../categorygroup/categoryGroup.types";

const createEmptyNormalisedCategoryData = (): NormalisedCategoryData => ({
  categoryGroups: {},
  categories: {},
  months: {},
});

export function normaliseCategories(
  categoryGroups: db.CategoryGroupWithCategoriesAndMonths[],
  memos: db.MonthMemo[]
): NormalisedData {
  const normalisedData: NormalisedCategoryData = categoryGroups.reduce(
    (acc, categoryGroup) => {
      const groupId = asCategoryGroupId(categoryGroup.id);

      acc.categoryGroups[groupId] = {
        id: groupId,
        name: categoryGroup.name,
        position: categoryGroup.position,
        categories: categoryGroup.categories.map((cat) => asCategoryId(cat.id)),
      };

      categoryGroup.categories.forEach((cat) => {
        const categoryId = asCategoryId(cat.id);

        acc.categories[categoryId] = {
          id: categoryId,
          categoryGroupId: asCategoryGroupId(cat.categoryGroupId),
          name: cat.name,
          months: cat.months.map((m) => asMonthId(m.id)),
          position: cat.position,
        };

        cat.months.forEach((month) => {
          const monthId = asMonthId(month.id);

          acc.months[monthId] = {
            id: monthId,
            categoryId,
            month: month.month.toISOString(),
            activity: convertDecimalToNumber(month.activity),
            assigned: convertDecimalToNumber(month.assigned),
            available: convertDecimalToNumber(month.available),
          };
        });
      });

      return acc;
    },
    createEmptyNormalisedCategoryData()
  );

  const monthKeys = [
    ...new Set(
      Object.values(normalisedData.months).map((m) => m.month.slice(0, 7))
    ),
  ].sort();

  const memoByMonth: MemoByMonth = {};

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
