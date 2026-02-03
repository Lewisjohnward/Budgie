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
  };

  return account;
};
