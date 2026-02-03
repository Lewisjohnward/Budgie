import {
  type db,
  type TransactionId,
} from "../../transaction/transaction.types";
import { type Account } from "./account.prisma";

/**
 * Normalized structures used for fast lookups and UI state.
 * Transactions, accounts, and categories are stored in maps keyed by ID.
 */
export type NormalisedAccounts = {
  accounts: Record<string, NormalisedAccount>;
  transactions: Record<string, NormalisedTransaction>;
  categories: Record<string, NormalisedCategory>;
  categoryGroups: Record<string, NormalisedCategoryGroup>;
};

/**
 * Normalized account.
 * `transactions` stores only transaction IDs.
 * `balance` is converted to number for convenience in calculations/UI.
 */
export type NormalisedAccount = Omit<Account, "transactions" | "balance"> & {
  transactionIds: TransactionId[];
  balance: number;
};

/**
 * Normalized transaction.
 * inflow/outflow converted to number for easier computation.
 */
export type NormalisedTransaction = Omit<
  db.Transaction,
  "inflow" | "outflow"
> & {
  inflow: number;
  outflow: number;
};

/**
 * Normalized category.
 * Stores minimal info for fast lookup.
 */
export type NormalisedCategory = {
  id: string;
  userId: string;
  name: string;
  categoryGroupId: string | null;
};

/**
 * Normalized category group.
 */
export type NormalisedCategoryGroup = {
  id: string;
  userId: string;
  name: string;
  position: number;
};
