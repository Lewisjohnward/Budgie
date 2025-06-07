import { CategoryGroup, NormalizedCategories } from "../category.types";
import { convertDecimalToNumber } from "../../../../shared/utils/convertDecimalToNumber";

export function normaliseCategories(categoryGroups: CategoryGroup[]) {
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
    } as NormalizedCategories,
  );
  return normalizedData;
}
