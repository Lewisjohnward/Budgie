import {
  asAccountId,
  asCategoryGroupId,
  asCategoryId,
  asMonthId,
  asMonthKey,
  asPayeeId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";

import {
  ApiAccount,
  ApiCategory,
  ApiMonth,
  ApiPayee,
  ApiTransaction,
} from "@/core/types/exported-types";

import {
  AccountBranded,
  CategoryBranded,
  MonthBranded,
  PayeeBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";

export const toCategory = (c: ApiCategory): CategoryBranded => ({
  id: asCategoryId(c.id),
  name: c.name,
  position: c.position,
  categoryGroupId: asCategoryGroupId(c.categoryGroupId),
});

export const toMonth = (m: ApiMonth): MonthBranded => ({
  id: asMonthId(m.id),
  categoryId: asCategoryId(m.categoryId),
  month: asMonthKey(m.month),
  activity: m.activity,
  assigned: m.assigned,
  available: m.available,
});

export const toAccount = (a: ApiAccount): AccountBranded => ({
  id: asAccountId(a.id),
  name: a.name,
  position: a.position,
  open: a.open,
  type: a.type,
  deletable: a.deletable,
  balance: a.balance,
});

export const toTransaction = (t: ApiTransaction): TransactionBranded => ({
  id: asTransactionId(t.id),
  accountId: asAccountId(t.accountId),
  categoryId: t.categoryId ? asCategoryId(t.categoryId) : null,
  payeeId: t.payeeId ? asPayeeId(t.payeeId) : null,
  date: t.date,
  memo: t.memo,
  inflow: t.inflow,
  outflow: t.outflow,
});

export const toPayee = (p: ApiPayee): PayeeBranded => ({
  id: asPayeeId(p.id),
  name: p.name,
  origin: p.origin,
  defaultCategoryId: p.defaultCategoryId
    ? asCategoryId(p.defaultCategoryId)
    : null,
  includeInPayeeList: p.includeInPayeeList,
  automaticallyCategorisePayee: p.automaticallyCategorisePayee,
});
