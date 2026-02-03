import type {
  Prisma,
  CategoryGroup as PrismaCategoryGroup,
} from "@prisma/client";

export type CategoryGroupWithCategoriesAndMonths =
  Prisma.CategoryGroupGetPayload<{
    include: { categories: { include: { months: true } } };
  }>;

export type CategoryGroup = PrismaCategoryGroup;
