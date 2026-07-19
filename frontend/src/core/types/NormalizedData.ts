import {
  AccountId,
  CategoryGroupId,
  CategoryId,
  CategoryMonthMap,
  MemoId,
  MonthId,
  MonthKey,
  NoteId,
  PayeeId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";
import { Month } from "./Allocation";

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
  transactionIds: string[];
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string;
  date: Date;
  inflow: number | null;
  outflow: number | null;
  payee: string | null;
  memo: string | null;
  category: string;
};

export type Category = {
  id: string;
  userId: string;
  categoryGroupId: string;
  name: string;
  months: string[];
  position: number;
};

export type NormalizedData = {
  accounts: { [key: string]: Account };
  transactions: { [key: string]: Transaction };
  categories: { [key: string]: Category };
  categoryGroups: { [key: string]: CategoryGroup };
};

export type CategoryGroup = {
  id: string;
  name: string;
  categories: string[];
};

export type CategoryGroupContext = Omit<CategoryGroup, "categories">;

export type CategoryT = {
  id: string;
  userId: string;
  categoryId: string;
  // type: "EXPENSE" | "INCOME";
  name: string;
  assigned: number;
  activity: number;
};

export type CategoriesNormalizedData = {
  categoryGroups: { [key: string]: CategoryGroup };
  categories: { [key: string]: CategoryT };
};

export type MappedCategoryGroups = { open: boolean } & CategoryGroup;

export type CategoriesDataMapped = {
  categoryGroups: { [key: string]: MappedCategoryGroups };
  categories: { [key: string]: CategoryT };
};

/// Snapshot
export type NoteBranded = {
  id: NoteId;
  month: MonthKey;
  content: string;
};

export const SYSTEM_PAYEE_NAMES = [
  "Manual Balance Adjustment",
  "Starting Balance",
] as const;

export type SystemPayeeName = (typeof SYSTEM_PAYEE_NAMES)[number];

export const PAYEE_ORIGIN = ["USER", "SYSTEM"] as const;

export type PayeeOrigin = (typeof PAYEE_ORIGIN)[number];

export type CategoryGroupBranded = {
  id: CategoryGroupId;
  name: string;
  position: number;
};

export type CategoryBranded = {
  id: CategoryId;
  categoryGroupId: CategoryGroupId;
  name: string;
  position: number;
};

export type MonthBranded = {
  id: MonthId;
  month: MonthKey;
  activity: number;
  assigned: number;
  available: number;
  categoryId: CategoryId;
};

export type AccountBranded = {
  id: AccountId;
  name: string;
  position: number;
  open: boolean;
  deletable: boolean;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
};

export type TransactionBranded = {
  id: TransactionId;
  accountId: AccountId;
  categoryId: CategoryId | null;
  date: string;
  inflow: number;
  outflow: number;
  payeeId: string | null;
  memo: string;
};

export type PayeeBranded = {
  id: PayeeId;
  name: string;
  origin: PayeeOrigin;
  defaultCategoryId: CategoryId | null;
  includeInPayeeList: boolean;
  automaticallyCategorisePayee: boolean;
};

export type BudgetSnapshot = {
  categoryGroups: {
    user: Record<CategoryGroupId, CategoryGroupBranded>;
    inflow: CategoryGroupBranded;
    uncategorised: CategoryGroupBranded;
  };
  categories: {
    user: Record<CategoryId, CategoryBranded>;
    rta: CategoryBranded;
    uncategorised: CategoryBranded;
  };
  months: Record<MonthId, MonthBranded>;
  // monthsByDate: Record<MonthKey, CategoryMonthMap>;
  // This index may be useful although it will be a monthId duplication
  // it can be used to do categoryMonths[categoryId] -> monthId
  // categoryMonths: Record<CategoryId, MonthId[]>
  accounts: Record<AccountId, AccountBranded>;
  transactions: Record<TransactionId, TransactionBranded>;
  payees: Record<PayeeId, PayeeBranded>;
  notesByMonth: Record<MonthKey, NoteBranded>;
  monthKeys: MonthKey[];
};
