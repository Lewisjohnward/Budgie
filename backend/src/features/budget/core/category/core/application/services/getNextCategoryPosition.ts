import { Prisma } from "@prisma/client";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { type CategoryGroupId } from "../../../../categorygroup/categoryGroup.types";

type NextCategoryPosition = number;

/**
 * Calculates the next sequential sorting position for a new category within a specific category group.
 * Looks up the maximum existing position index and increments it by 1, defaulting to 0 if the group is empty.
 *
 * @param {Prisma.TransactionClient} prisma - The active Prisma transaction client database context.
 * @param {CategoryGroupId} categoryGroupId - The unique identifier of the parent category group to scope the calculation.
 * @returns {Promise<NextCategoryPosition>} The next available position index (0-indexed integer).
 */
export const getNextCategoryPosition = async (
  prisma: Prisma.TransactionClient,
  categoryGroupId: CategoryGroupId
): Promise<NextCategoryPosition> => {
  const latest = await categoryRepository.getMaxCategoryPositionInGroup(
    prisma,
    categoryGroupId
  );

  return latest !== null ? latest + 1 : 0;
};
