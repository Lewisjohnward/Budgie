import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getMonth } from "../../../category/core/utils/getMonth";
import { memoRepository } from "../../../../../../shared/repository/memoRepositoryImpl";
import { type UserId } from "../../../../../user/auth/auth.types";
import { asMonthId } from "../../../category/core/category.types";

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
  userId: UserId
): Promise<void> => {
  const { startOfCurrentMonth, nextMonth } = getMonth();
  const monthsToCreate = [startOfCurrentMonth, nextMonth].map((m) => ({
    id: asMonthId(uuidv4()),
    userId,
    month: m,
    content: "",
  }));

  await memoRepository.insertMemos(tx, monthsToCreate);
};
