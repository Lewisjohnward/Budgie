import { asUserId } from "../../../user/auth/auth.types";
import { asMemoId, db, type DomainMemo } from "../memo.types";

export const toDomainMemo = (m: db.Memo): DomainMemo => {
  return {
    id: asMemoId(m.id),
    userId: asUserId(m.userId),
    month: m.month,
    content: m.content,
  };
};
