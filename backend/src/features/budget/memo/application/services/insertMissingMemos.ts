import { Prisma } from "@prisma/client";
import { MemoInvariantError } from "../../memo.errors";
import { roundToStartOfMonth } from "../../../../../shared/utils/roundToStartOfMonth";
import { getMonthRange } from "../../../category/utils/getMonthRange";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Ensures month memos exist when a transaction falls before the user's
 * earliest existing memo month.
 *
 * If the transaction month precedes the earliest memo month, inserts missing
 * memo months from the transaction month up to (but excluding) the earliest
 * existing month. Existing memos are not overwritten.
 *
 * @param tx - Transaction-scoped Prisma client
 * @param userId - ID of the owning user
 * @param date - Transaction date used to determine required memo months
 *
 * @throws {MemoInvariantError}
 * Thrown if the user has no existing month memos.
 */

export const insertMissingMemos = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  date: Date
): Promise<void> => {
  const earliestMonth = await memoRepository.getEarliestMemoMonth(tx, userId);

  if (!earliestMonth) {
    throw new MemoInvariantError(
      `Expected existing MonthMemo rows for user ${userId}`
    );
  }

  const earliest = roundToStartOfMonth(earliestMonth);

  const txMonth = roundToStartOfMonth(date);

  if (txMonth < earliest) {
    const endExclusive = earliest;
    const monthsToInsert = getMonthRange(txMonth, endExclusive, {
      startInclusive: true,
      endInclusive: false,
    });

    await memoRepository.insertMemos(tx, userId, monthsToInsert);
  }
};
