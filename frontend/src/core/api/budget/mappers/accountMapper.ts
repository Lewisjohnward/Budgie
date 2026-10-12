import { ApiAccount } from "@/core/types/exported-types";
import { AccountBranded } from "@/core/types/NormalizedData";
import { asAccountId } from "@/pages/budget/allocation/types/types";

export const mapAccount = (account: ApiAccount): AccountBranded => ({
  id: asAccountId(account.id),
  name: account.name,
  position: account.position,
  open: account.open,
  deletable: account.deletable,
  type: account.type,
  balance: Number(account.balance),
});
