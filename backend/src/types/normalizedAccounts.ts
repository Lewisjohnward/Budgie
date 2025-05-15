import { Account, CategoryGroup, Transaction } from "./db";

export type NormalizedAccountData = {
  accounts: { [key: string]: NormalizedAccount };
  transactions: { [key: string]: NormalizedTransaction };
  categories: { [key: string]: NormalizedCategory };
  categoryGroups: { [key: string]: NormalizedCategoryGroup };
};

type NormalizedCategory = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string | null;
};

type NormalizedAccount = Omit<Account, "transactions" | "balance"> & {
  transactions: string[];
  balance: number;
};

type NormalizedTransaction = Omit<
  Transaction,
  "category" | "inflow" | "outflow"
> & {
  category: string | null;
  inflow: number;
  outflow: number;
};

type NormalizedCategoryGroup = Omit<CategoryGroup, "categories">;
