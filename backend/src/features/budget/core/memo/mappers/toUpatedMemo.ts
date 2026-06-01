import { toMonthKey } from "../../../utils/toMonthKey";
import { db, type MemoDto } from "../memo.types";

/**
 * Maps a database Memo entity to the Memo DTO used by the API.
 * Converts DB date into MonthKey format and removes DB-specific fields.
 */
export const toMemoDto = (memo: db.Memo): MemoDto => ({
  id: memo.id,
  month: toMonthKey(memo.month),
  content: memo.content,
});
