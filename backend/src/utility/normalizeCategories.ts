import { CategoryGroup, NormalizedCategories } from "../types/_index";
import { convertDecimalToNumber } from "./budget";

export function normalizeCategories(categoryGroups: CategoryGroup[]) {
  const normalizedData = categoryGroups.reduce(
    (acc, categoryGroup) => {
      acc.categoryGroups[categoryGroup.id] = {
        id: categoryGroup.id,
        name: categoryGroup.name,

        categories: categoryGroup.categories.map((cat) => cat.id),
      };

      categoryGroup.categories.forEach((cat) => {
        acc.categories[cat.id] = {
          id: cat.id,
          userId: cat.userId,
          categoryGroupId: cat.categoryGroupId,
          name: cat.name,
          months: cat.months.map((month) => month.id),
        };

        cat.months.forEach((month) => {
          acc.months[month.id] = {
            id: month.id,
            categoryId: cat.id,
            month: month.month,
            activity: convertDecimalToNumber(month.activity),
            assigned: convertDecimalToNumber(month.assigned),
          };
        });
      });

      return acc;
    },
    {
      categoryGroups: {},
      categories: {},
      months: {},
    } as NormalizedCategories,
  );
  return normalizedData;
}
