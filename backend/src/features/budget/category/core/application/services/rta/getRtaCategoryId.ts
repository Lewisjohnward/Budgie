import { Prisma } from "@prisma/client";
import { asCategoryId, type CategoryId } from "../../../category.types";
import { categoryRepository } from "../../../../../../../shared/repository/categoryRepositoryImpl";
import { RTACategoryIdNotFound } from "../../../category.errors";
import { type UserId } from "../../../../../../user/auth/auth.types";

/**
 * Retrieves the **Ready To Assign (RTA)** category ID for a given user.
 *
 * The RTA category is a system-defined category that represents unassigned
 * funds in the budgeting domain. Every user is expected to have exactly one.
 *
 * This function:
 * - Queries the repository for the user’s RTA category ID.
 * - Ensures the category exists.
 * - Converts the raw database identifier into a branded `CategoryId`.
 *
 * Domain invariants:
 * - Each user must have a single RTA category.
 * - The returned value is guaranteed to be a valid `CategoryId`.
 *
 * @param tx - Prisma transaction client used to ensure atomicity within a larger operation.
 * @param userId - The ID of the user whose RTA category is being retrieved.
 *
 * @returns A promise resolving to the user's RTA `CategoryId`.
 *
 * @throws {RTACategoryIdNotFound} If the user does not have an RTA category.
 */
export const getRtaCategoryId = async (
  tx: Prisma.TransactionClient,
  userId: UserId
): Promise<CategoryId> => {
  const id = await categoryRepository.getRtaCategoryId(tx, userId);

  if (!id) throw new RTACategoryIdNotFound();

  return asCategoryId(id);
};
