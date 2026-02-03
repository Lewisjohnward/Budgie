import { Prisma } from "@prisma/client";
import { db, type MemoId } from "./memo.types";
import { type UserId } from "../../user/auth/auth.types";

export interface MemoRepository {
  /**
   * Returns a memo by ID if it exists and is owned by the given user.
   *
   * @param tx - Transaction-scoped Prisma client
   * @param userId - ID of the owning user
   * @param memoId - Memo ID
   *
   * @returns The memo if found and owned by the user, otherwise null.
   */

  getMemo(
    tx: Prisma.TransactionClient,
    userId: UserId,
    memoId: MemoId
  ): Promise<db.Memo | null>;

  /**
   * Updates the content of an existing memo.
   *
   * Callers must ensure the memo exists and ownership has been verified.
   *
   * @param tx - Transaction-scoped Prisma client
   * @param id - Memo ID
   * @param content - New memo content
   */

  updateMemo(
    tx: Prisma.TransactionClient,
    memoId: MemoId,
    content: string
  ): Promise<db.Memo>;

  /**
   * Inserts month memos for the given user.
   *
   * Existing memos for the same `(userId, month)` are left untouched.
   *
   * @param tx - Transaction-scoped Prisma client
   * @param userId - ID of the owning user
   * @param months - Months for which to ensure memos exist
   */

  insertMemos(
    tx: Prisma.TransactionClient,
    userId: UserId,
    months: Date[]
  ): Promise<void>;

  /**
   * Returns the earliest month memo for a user.
   *
   * Used to determine the lower bound of existing memo months.
   * Callers must handle the case where no memo exists.
   *
   * @param tx - Transaction-scoped Prisma client
   * @param userId - ID of the owning user
   *
   * @returns The earliest memo month, or null if none exist.
   */
  getEarliestMemoMonth(
    tx: Prisma.TransactionClient,
    userId: UserId
  ): Promise<Date | null>;
}
