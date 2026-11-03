import {
  AccountBranded,
  MonthBranded,
  NoteBranded,
  PayeeBranded,
  TransactionBranded,
} from "@/core/types/NormalizedData";
import {
  AccountId,
  CategoryId,
  MonthId,
  NoteId,
  PayeeId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";

// Create
export type CreateTransactionInput = {
  accountId: AccountId;
  date?: string;
  transferAccountId?: AccountId;
  payeeId?: PayeeId;
  payeeName?: string;
  categoryId?: CategoryId;
  memo?: string;
  inflow?: string;
  outflow?: string;
};

export type CreateTransactionResult = {
  created: {
    transactions:
    | {
      type: "normal";
      transaction: TransactionBranded;
    }
    | {
      type: "transfer";
      source: TransactionBranded;
      destination: TransactionBranded;
    };
    payee?: PayeeBranded;
    memos: NoteBranded[];
    months: Record<MonthId, MonthBranded>;
  };
  updated: {
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};

// Edit
export type EditTransactionInput = {
  accountId?: AccountId;
  date?: string;
  payeeId?: PayeeId | null;
  payeeName?: string;
  categoryId?: CategoryId | null;
  memo?: string;
  inflow?: string;
  outflow?: string;
  cleared?: boolean;
  transferAccountId?: AccountId | null;
};

export type EditTransactionResult = {
  created: {
    payee: Record<PayeeId, PayeeBranded>;
    months: Record<MonthId, MonthBranded>;
    memos: Record<NoteId, NoteBranded>;
  };
  updated: {
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
    transactions: Record<AccountId, TransactionBranded>;
  };
};

// Delete
export type DeleteTransactionsInput = {
  transactionIds: TransactionId[];
};

export type DeleteTransactionsResult = {
  deleted: {
    transactions: Record<TransactionId, TransactionBranded>;
  };
  updated: {
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};

// Duplicate
export type DuplicateTransactionsInput = {
  transactionIds: TransactionId[];
};

export type DuplicateTransactionsResult = {
  created: {
    transactions: TransactionBranded[];
  };
  updated: {
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};

// Edit bulk
export type EditBulkTransactionsInput = {
  transactionIds: TransactionId[];
  updates:
  { categoryId: CategoryId } | { accountId: AccountId } | { memo: string };
};

export type EditBulkTransactionsResult = {
  updated: {
    transactions: Record<string, TransactionBranded>;
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
  };
};
