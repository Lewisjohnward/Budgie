import { ApiMemo } from "@/core/types/exported-types";
import { NoteBranded } from "@/core/types/NormalizedData";
import { asNoteId, asMonthKey } from "@/pages/budget/allocation/types/types";

export const mapMemo = (memo: ApiMemo): NoteBranded => ({
  id: asNoteId(memo.id),
  month: asMonthKey(memo.month),
  content: memo.content,
});
