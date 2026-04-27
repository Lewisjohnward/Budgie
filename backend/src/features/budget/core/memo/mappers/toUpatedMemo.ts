import { toMonthKey } from "../../../utils/toMonthKey";
import { db, UpdatedMemo } from "../memo.types";

/**
 * Maps a database Memo entity to the UpdatedMemo DTO used by the API.
 * Converts DB date into MonthKey format and removes DB-specific fields.
 */
export const toUpdatedMemo = (memo: db.Memo): UpdatedMemo => ({
  id: memo.id,
  month: toMonthKey(memo.month),
  content: memo.content,
});
