import type {
  Prisma,
  CategoryGroup as PrismaCategoryGroup,
} from "@prisma/client";

/**
 * Represents a CategoryGroup entity loaded from the database with its related categories
 * and each category’s associated months.
 *
 * This is a rich Prisma payload used for application-level read operations where full
 * relational context is required.
 */
export type CategoryGroupWithCategoriesAndMonths =
  Prisma.CategoryGroupGetPayload<{
    include: { categories: { include: { months: true } } };
  }>;

/**
 * Represents a CategoryGroup entity loaded from the database with only its related category IDs.
 *
 * This lightweight Prisma payload is used when only category relationships are needed
 * without loading full category or month data.
 */
export type CategoryGroupWithCategoryIds = Prisma.CategoryGroupGetPayload<{
  include: { categories: { select: { id: true } } };
}>;

/**
 * Represents a CategoryGroup record as stored in the database.
 *
 * This type is a direct alias for the Prisma-generated `CategoryGroup` model,
 * including all fields defined in the Prisma schema.
 */
export type CategoryGroup = PrismaCategoryGroup;
