import { Decimal } from "@prisma/client/runtime/library";
import { asUserId, type UserId } from "../../../../../../user/auth/auth.types";
import { type AssignmentsPayload } from "../../month.schema";
import {
  asMonthId,
  type MonthId,
  type UpdatedMonthsById,
} from "../../../core/category.types";
import { prisma } from "../../../../../../../shared/prisma/client";
import { assignService } from "../../month.service";

export type UpdateMonthCommand = Omit<
  AssignmentsPayload,
  "userId" | "assignments"
> & {
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
): Promise<UpdatedMonthsById> => {
  return await prisma.$transaction(async (tx) => {
    return assignService.updateMonths(tx, toUpdateMonthCommand(payload));
  });
};
