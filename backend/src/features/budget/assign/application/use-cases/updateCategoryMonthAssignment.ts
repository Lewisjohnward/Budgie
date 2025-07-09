import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { calculateCategoryMonths } from "../../../category/domain/month.domain";
import { AssigningToProtectedCategoryMonthError } from "../../assign.errors";
import { AssignPayload } from "../../assign.schema";
import { categoryService } from "../../../category/category.service";

export const updateCategoryMonthAssignment = async (payload: AssignPayload) => {
  const { userId, monthId, assigned } = payload;
  await prisma.$transaction(async (tx) => {
    const monthToUpdate = await categoryRepository.getMonth(
      tx,
      userId,
      monthId,
    );

    const changeInAssigned = assigned.sub(monthToUpdate.assigned);

    if (changeInAssigned.eq(0)) {
      return;
    }

    const uncategorisedCategoryId =
      await categoryRepository.getUncategorisedCategoryId(tx, userId);

    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);
    const protectedCategoryIds = [uncategorisedCategoryId, rtaCategoryId];
    const assigningToProtectedCategory = protectedCategoryIds.includes(
      monthToUpdate.categoryId,
    );

    if (assigningToProtectedCategory) {
      throw new AssigningToProtectedCategoryMonthError();
    }

    const months = await categoryRepository.getMonthsForCategoriesStartingFrom(
      tx,
      [monthToUpdate.categoryId],
      monthToUpdate.month,
    );

    const updatedMonthsForCategory = calculateCategoryMonths(
      months,
      changeInAssigned,
    );

    await categoryRepository.updateMonths(tx, updatedMonthsForCategory);

    await categoryService.rta.calculateMonthsAvailable(tx, userId, rtaCategoryId);
  });
};
