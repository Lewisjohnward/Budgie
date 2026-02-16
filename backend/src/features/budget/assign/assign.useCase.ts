import { prisma } from "../../../shared/prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { asUserId, UserId } from "../../user/auth/auth.types";
import { asMonthId, MonthId } from "../category/category.types";
import { updateCategoryMonthAssignment } from "./application/use-cases/updateCategoryMonthAssignment";
import { AssignmentsPayload } from "./assign.schema";

type UpdateMonthCommand = Omit<
  AssignmentsPayload,
  "userId" | "assignmentsArray"
> & {
  userId: UserId;
  assignmentsArray: { assigned: Decimal; monthId: MonthId }[];
};

const toUpdateMonthCommand = (p: AssignmentsPayload): UpdateMonthCommand => ({
  ...p,
  userId: asUserId(p.userId),
  assignmentsArray: p.assignmentsArray.map((t) => ({
    assigned: t.assigned,
    monthId: asMonthId(t.monthId),
  })),
});

export const assignUseCase = {
  updateCategoryMonthAssignment,

  updateCategoryAssignmentsForMonth: async (payload: AssignmentsPayload) => {
    const { userId, assignmentsArray } = toUpdateMonthCommand(payload);

    const monthIds = assignmentsArray.map((a) => a.monthId);

    await prisma.$transaction(async (tx) => {
      const monthsToUpdate = await tx.month.findMany({
        where: {
          id: {
            in: monthIds,
          },
        },
      });
      if (monthsToUpdate.length !== monthIds.length) {
        throw new Error("You don't have access");
      }

      // calculate change in assigned per month
      // if change in assigned is 0 then remove
      // get uncatId and rtaI
      // If user assigning to protects cat id throw err
      // Update months
    });
  },
};
