import { asUserId } from "../../../user/auth/auth.types";
import { asAccountId, type DomainAccount, type db } from "../account.types";

export const toDomainAccount = (row: db.Account): DomainAccount => {
  const account: DomainAccount = {
    id: asAccountId(row.id),
    name: row.name,
    position: row.position,
    userId: asUserId(row.userId),
    open: row.open,
    type: row.type,
    balance: row.balance,
    // TODO:(lewis 2026-02-19 05:01) this needs changing form bool | null to bool
    deletable: row.deletable!,
  };

  return account;
};
