import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { calculateCategoryMonths } from "../../../category/domain/month.domain";
import { AssigningToProtectedCategoryMonthError } from "../../assign.errors";
import { categoryService } from "../../../category/category.service";
import { asMonthId, type MonthId } from "../../../category/category.types";
import { type AssignPayload } from "../../assign.schema";
import { asUserId, UserId } from "../../../../user/auth/auth.types";

/**
 * Represents a command for updating a category month assignment.
 *
 * This type is derived from `AssignPayload` but ensures that `monthId`
 * is converted to the branded `MonthId` type for type safety.
 */
export type UpdateMonthCommand = Omit<AssignPayload, "userId" | "monthId"> & {
  userId: UserId;
  monthId: MonthId;
};

/**
 * Converts a raw `AssignPayload` into a type-safe `UpdateMonthCommand`.
 *
 * Specifically, it:
 * - Copies all fields from the input payload
 * - Converts `monthId` from `string` to the branded `MonthId` type
 *
 * @param p - The raw assignment payload
 * @returns The same payload with `monthId` converted to `MonthId`
 */
const toUpdateMonthCommand = (p: AssignPayload): UpdateMonthCommand => ({
  ...p,
  userId: asUserId(p.userId),
  monthId: asMonthId(p.monthId),
});

/**
 * Updates the assigned amount for a specific category month.
 *
 * This function performs the update inside a single database transaction to ensure atomicity.
 * It enforces invariants and updates related RTA (Ready-To-Assign) calculations:
 *
 * Steps:
 * 1. Fetches the target month for the given category and user.
 * 2. Calculates the change in the assigned amount.
 * 3. If the assigned amount hasn’t changed, exits early.
 * 4. Checks whether the month belongs to a protected category (Uncategorised or RTA)
 *    and throws an error if attempting to assign to a protected month.
 * 5. Loads all months for the category starting from the target month.
 * 6. Calculates updated assigned amounts for the category months.
 * 7. Updates the months in the database.
 * 8. Recalculates RTA months available.
 *
 * @param payload - The payload describing the category month assignment update.
 * @param payload.userId - The ID of the user performing the assignment.
 * @param payload.monthId - The month to update (converted internally to a MonthId type).
 * @param payload.categoryId - The ID of the category to assign.
 * @param payload.assigned - The new assigned amount for the month (Decimal).
 *
 * @throws {AssigningToProtectedCategoryMonthError} If the month belongs to a protected category
 * (Uncategorised or RTA).
 */
export const updateCategoryMonthAssignment = async (
  payload: AssignPayload
): Promise<void> => {
  const { userId, monthId, assigned } = toUpdateMonthCommand(payload);

  await prisma.$transaction(async (tx) => {
    const monthToUpdate = await categoryService.months.getMonth(
      tx,
      userId,
      monthId
    );

    const changeInAssigned = assigned.sub(monthToUpdate.assigned);

    if (changeInAssigned.eq(0)) {
      return;
    }

    const [uncategorisedCategoryId, rtaCategoryId] = await Promise.all([
      categoryRepository.getUncategorisedCategoryId(tx, userId),
      categoryService.rta.getRtaCategoryId(tx, userId),
    ]);

    const protectedCategoryIds = [uncategorisedCategoryId, rtaCategoryId];
    const assigningToProtectedCategory = protectedCategoryIds.includes(
      monthToUpdate.categoryId
    );

    if (assigningToProtectedCategory) {
      throw new AssigningToProtectedCategoryMonthError();
    }

    const months =
      await categoryService.months.getMonthsForCategoriesStartingFrom(
        tx,
        [monthToUpdate.categoryId],
        monthToUpdate.month
      );

    const updatedMonthsForCategory = calculateCategoryMonths(
      months,
      changeInAssigned
    );

    await categoryRepository.updateMonths(tx, updatedMonthsForCategory);

    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );
  });
};
