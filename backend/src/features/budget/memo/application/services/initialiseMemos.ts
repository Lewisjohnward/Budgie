import { Prisma } from "@prisma/client";
import { getMonth } from "../../../category/utils/getMonth";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";

/**
 * Initializes month memos for a newly created user.
 *
 * Ensures memos exist for the current month and the next month.
 * Existing memos are left untouched.
 *
 * @param tx - Transaction-scoped Prisma client
 * @param userId - ID of the user to initialize memos for
 */

export const initialiseMemos = async (
  tx: Prisma.TransactionClient,
  userId: string
): Promise<void> => {
  const { startOfCurrentMonth, nextMonth } = getMonth();
  const monthsToCreate = [startOfCurrentMonth, nextMonth];

  await memoRepository.insertMemos(tx, userId, monthsToCreate);
};
