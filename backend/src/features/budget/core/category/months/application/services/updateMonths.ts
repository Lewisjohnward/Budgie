import { type Prisma } from "@prisma/client";
import {
  type CategoryId,
  type DomainMonth,
  type MonthId,
  type UpdatedMonthsById,
} from "../../../core/category.types";
import { type UpdateMonthCommand } from "../use-cases/updateMonths";
import {
  DuplicateMonthIdError,
  MonthNotFoundError,
  MonthsNotSameDateError,
  AssigningToProtectedCategoryMonthError,
} from "../../month.errors";
import { categoryService } from "../../../core/category.service";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { categoryMapper } from "../../../core/category.mapper";
import { calculateCategoryMonths } from "../../../core/domain/month.domain";
import { groupBy } from "../../../core/utils/groupBy";

export const updateMonths = async (
  tx: Prisma.TransactionClient,
  command: UpdateMonthCommand
): Promise<UpdatedMonthsById> => {
  const { assignments, userId } = command;

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

  // Get protected category ids
  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

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

  // Use the nonZeroDeltas array to build an array of allUpdatedMonths
  for (const { delta, categoryId } of nonZeroDeltas) {
    // Get all the months for the category
    const categoryMonths = groupedMonthsByCategory[categoryId];

    // Calculate updated months for this category using the delta
    const updatedMonths = calculateCategoryMonths(categoryMonths, delta);

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

  // TODO:(lewis 2026-04-21 01:10) we need to test that we are providing rta month updates, just spend an hour on this bug
  return categoryMapper.mapMonthsImproveName([
    ...allUpdatedMonths,
    ...updatedRtaMonths,
  ]);
};
