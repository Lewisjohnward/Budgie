import {
  CategoryGroupUserBranded,
  CategoryGroupSystemBranded,
  CategoryUserBranded,
  CategorySystemBranded,
} from "@/core/types/NormalizedData";
import {
  AccountId,
  TransactionId,
  PayeeId,
  CategoryId,
  CategoryGroupId,
} from "@/pages/budget/allocation/types/types";

export type DetailedTransaction = {
  id: TransactionId;
  accountId: AccountId;
  accountName: string;
  date: Date;
  payee: PayeeId | null;
  categoryGroup: CategoryGroupUserBranded | CategoryGroupSystemBranded;
  categoryId: CategoryId;
  category: CategoryUserBranded | CategorySystemBranded;
  unassigned: boolean;
  memo: string | null;
  inflow: number;
  outflow: number;
};

export type AccountOverview = {
  name: string;
  type: "BANK" | "CREDIT_CARD" | "ALL_ACCOUNTS";
  balance: number;
  transactions: DetailedTransaction[];
  id: string;
};

export type CategoriesById = Record<
  CategoryId,
  CategoryUserBranded | CategorySystemBranded
>;

export type CategoryGroupsById = Record<
  CategoryGroupId,
  CategoryGroupUserBranded | CategoryGroupSystemBranded
>;
