import { Category, CategoryGroup, Month } from "./_index";

export type NormalizedCategories = {
  categoryGroups: {
    [key: string]: NormalizedCategoryGroup;
  };
  categories: {
    [key: string]: NormalizedCategory;
  };
  months: {
    [key: string]: NormalizedMonth;
  };
};

type NormalizedCategoryGroup = Omit<CategoryGroup, "categories" | "userId"> & {
  categories: string[];
};

type NormalizedCategory = Omit<Category, "months"> & {
  months: string[];
  categoryGroupId: string;
};

type NormalizedMonth = Omit<Month, "activity" | "assigned"> & {
  categoryId: string;
  activity: number;
  assigned: number;
};
