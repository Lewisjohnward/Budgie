import { prisma } from "../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { categoryMapper } from "../../../category/category.mapper";
import { categoryService } from "../../../category/category.service";
import {
  asCategoryId,
  type CategoryId,
} from "../../../category/category.types";
import { groupBy } from "../../../category/utils/groupBy";
import { type GetMonthsForCategoriesPayload } from "../../assign.schema";
import { type CategoryMonthsMap } from "../../assign.types";

export type GetMonthsForCategoriesCommand = Omit<
  GetMonthsForCategoriesPayload,
  "userId" | "categoryIds"
> & {
  userId: UserId;
  categoryIds: CategoryId[];
};

const toGetMonthsForCategoriesCommand = (
  p: GetMonthsForCategoriesPayload
): GetMonthsForCategoriesCommand => ({
  ...p,
  userId: asUserId(p.userId),
  categoryIds: p.categoryIds.map(asCategoryId),
});

/**
 * Retrieves all months for the specified categories and returns them grouped by category.
 *
 * This use case performs the following steps:
 * 1. Normalizes and validates the input payload (`userId` and `categoryIds`).
 * 2. Ensures the requesting user owns all the specified categories.
 * 3. Fetches all months associated with the provided categories within a transaction.
 * 4. Groups the months by `categoryId`.
 * 5. Maps the grouped months into a DTO suitable for front-end consumption.
 *
 * @param payload - The raw request payload containing:
 *   - `userId`: ID of the requesting user
 *   - `categoryIds`: Array of category IDs to fetch months for
 * @returns A promise that resolves to a `CategoryMonthsMap`, where each key is a `CategoryId`
 *          and each value is an array of month DTOs for that category.
 *
 * @throws {CategoryNotFoundError} If any of the provided categories do not exist
 *                                  or are not owned by the user.
 */
export const getMonthsForCategories = async (
  payload: GetMonthsForCategoriesPayload
): Promise<CategoryMonthsMap> => {
  const { userId, categoryIds } = toGetMonthsForCategoriesCommand(payload);

  return prisma.$transaction(async (tx) => {
    await categoryService.categories.ensureUserOwnsCategories(
      tx,
      userId,
      categoryIds
    );

    const months = await categoryService.months.getMonthsForCategories(
      tx,
      categoryIds
    );

    // Group month by categoryId
    const groupedMonthsByCategory = groupBy(months, (m) => m.categoryId);

    return categoryMapper.mapMonthsByCategoryToDto(groupedMonthsByCategory);
  });
};
