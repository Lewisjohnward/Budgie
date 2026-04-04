import { prisma } from "../../../../../shared/prisma/client";
import { asUserId, UserId } from "../../../../user/auth/auth.types";
import { categoryService } from "../../../category/category.service";
import { asCategoryId, CategoryId } from "../../../category/category.types";
import { GetMonthsForCategoriesPayload } from "../../assign.schema";

export type GetMonthsForCategoriesCommand = Omit<
  GetMonthsForCategoriesPayload,
  "userId" | "categoryIds"
> & {
  userId: UserId;
  categoryIds: CategoryId[];
};

const toUpdateMonthCommand = (
  p: GetMonthsForCategoriesPayload
): GetMonthsForCategoriesCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryIds: p.categoryIds.map(asCategoryId),
});

/**
 * Retrieves all months for the specified categories.
 *
 * Validates that the provided categories belong to the user, then fetches
 * and returns the corresponding months within a database transaction.
 *
 * @param payload - Raw request payload containing userId and categoryIds
 * @returns Promise resolving to an array of domain Month objects
 *
 * @throws {CategoryNotFoundError} If any category does not exist or is not owned by the user
 */
export const getMonthsForCategories = async (
  payload: GetMonthsForCategoriesPayload
) => {
  const { userId, categoryIds } = toUpdateMonthCommand(payload);

  return await prisma.$transaction(async (tx) => {
    await categoryService.categories.ensureUserOwnsCategories(
      tx,
      userId,
      categoryIds
    );

    return await categoryService.months.getMonthsForCategories(tx, categoryIds);
  });
};
