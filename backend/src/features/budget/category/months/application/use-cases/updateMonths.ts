import { Decimal } from "@prisma/client/runtime/library";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { type AssignmentsPayload } from "../../month.schema";
import {
  asMonthId,
  type UpdatedMonthsByCategoryDto,
  type CategoryId,
  type DomainMonth,
  type MonthId,
} from "../../../core/category.types";
import {
  AssigningToProtectedCategoryMonthError,
  DuplicateMonthIdError,
  MonthNotFoundError,
  MonthsNotSameDateError,
} from "../../month.errors";
import { prisma } from "../../../../../../shared/prisma/client";
import { categoryService } from "../../../core/category.service";
import { categoryMapper } from "../../../core/category.mapper";
import { calculateCategoryMonths } from "../../../core/domain/month.domain";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { groupBy } from "../../../core/utils/groupBy";

type UpdateMonthCommand = Omit<AssignmentsPayload, "userId" | "assignments"> & {
  userId: UserId;
  assignments: { assigned: Decimal; monthId: MonthId }[];
};

const toUpdateMonthCommand = (p: AssignmentsPayload): UpdateMonthCommand => ({
  ...p,
  userId: asUserId(p.userId),
  assignments: p.assignments.map((t) => ({
    assigned: t.assigned,
    monthId: asMonthId(t.monthId),
  })),
});

/**
 * Updates the assigned amounts for one or more months while enforcing business rules.
 *
 * Rules enforced:
 * - Each month can only be assigned once per request.
 * - Multiple assignments must all share the same calendar month.
 * - Protected categories (e.g., RTA or Uncategorised) cannot be updated.
 *
 * @param payload - The assignments payload containing userId and month assignments
 * @returns An UpdatedMonthsByCategoryDto mapping category IDs to arrays of month DTOs.
 *          Each month DTO includes:
 *          - `id`: the month ID
 *          - `categoryId`: the category ID the month belongs to
 *          - `month`: the month date as an ISO string
 *          - `assigned`: the updated assigned amount as a string
 *          - `available`: the recalculated available amount as a string
 *          - `activity`: the recalculated activity as a string
 * @throws {DuplicateMonthIdError} If the same month appears more than once in the payload
 * @throws {MonthNotFoundError} If any month in the payload does not exist or is not owned by the user
 * @throws {MonthsNotSameDateError} If multiple months in the payload have different calendar dates
 * @throws {AssigningToProtectedCategoryMonthError} If attempting to assign to a protected category
 */
export const updateMonths = async (
  payload: AssignmentsPayload
): Promise<UpdatedMonthsByCategoryDto> => {
  const { userId, assignments } = toUpdateMonthCommand(payload);

  const monthIds = assignments.map((a) => a.monthId);

  // Prevent duplicate monthIds in the assignmentsArray.
  // This ensures a single assignment per month and avoids conflicting updates or
  // unintended overwrites when calculating deltas and updating future months.
  const monthIdSet = new Set<MonthId>();
  for (const { monthId } of assignments) {
    if (monthIdSet.has(monthId)) {
      throw new DuplicateMonthIdError();
    }
    monthIdSet.add(monthId);
  }

  return await prisma.$transaction(async (tx) => {
    // Get protected category ids
    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    const uncategorisedCategoryId =
      await categoryService.categories.getUncategorisedCategoryId(tx, userId);

    // Get months
    const rows = await tx.month.findMany({
      where: {
        id: { in: monthIds },
        category: {
          userId: userId,
        },
      },
    });

    const monthsToUpdate = rows.map(categoryMapper.toDomainMonth);

    if (monthsToUpdate.length !== monthIds.length) {
      throw new MonthNotFoundError();
    }
    // Ensure all months being updated share the same calendar date.
    // Multiple assignments are allowed, but only for the same month.
    const uniqueMonths = new Set(
      monthsToUpdate.map((m) => m.month.toISOString())
    );
    if (uniqueMonths.size > 1) {
      throw new MonthsNotSameDateError();
    }

    // Ensure user is not assigning to a month belonging to a protected category
    // This prevents accidental updates to special categories and keeps the check separate for clarity.
    const protectedCategoryIdsSet = new Set<CategoryId>([
      uncategorisedCategoryId,
      rtaCategoryId,
    ]);
    for (const month of monthsToUpdate) {
      if (protectedCategoryIdsSet.has(month.categoryId)) {
        throw new AssigningToProtectedCategoryMonthError();
      }
    }

    // Get current and future months for categories
    const currentAndFutureMonthsForCategories =
      await categoryService.months.getMonthsForCategoriesStartingFrom(
        tx,
        monthsToUpdate.map((m) => m.categoryId),
        monthsToUpdate[0].month
      );

    // Group months by categoryId
    const groupedMonthsByCategory = groupBy(
      currentAndFutureMonthsForCategories,
      (m) => m.categoryId
    );

    // Map of monthId → DomainMonth for quick lookup in assignmentsArray
    // Assumes all monthIds exist; we’ve already verified access above.
    const monthsById = Object.fromEntries(monthsToUpdate.map((m) => [m.id, m]));

    // Calculate the delta for each month
    // month.id isn't included because the first month in monthsByCategory is that month
    const monthDeltas = assignments.map((assignment) => {
      const month = monthsById[assignment.monthId];

      const delta = assignment.assigned.minus(month.assigned);

      return {
        categoryId: month.categoryId,
        delta,
      };
    });

    // Remove zero deltas
    const nonZeroDeltas = monthDeltas.filter((m) => !m.delta.isZero());

    const allUpdatedMonths: DomainMonth[] = [];
    const updatedMonthsByCategory: Record<CategoryId, DomainMonth[]> = {};

    // Use the nonZeroDeltas array to build an array of allUpdatedMonths
    for (const { delta, categoryId } of nonZeroDeltas) {
      // Get all the months for the category
      const categoryMonths = groupedMonthsByCategory[categoryId];

      // Calculate updated months for this category using the delta
      const updatedMonths = calculateCategoryMonths(categoryMonths, delta);

      // Record the recalculated months for this category after applying the delta
      updatedMonthsByCategory[categoryId] = updatedMonths;

      allUpdatedMonths.push(...updatedMonths);
    }

    // Update months
    await categoryRepository.updateMonths(tx, allUpdatedMonths);

    // Recalculate rta months
    const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );

    // Record the recalculated months for this rta category after recalculaing rta months
    updatedMonthsByCategory[rtaCategoryId] = updatedRtaMonths;

    return categoryMapper.mapMonthsByCategoryToDto(updatedMonthsByCategory);
  });
};
