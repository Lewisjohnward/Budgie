import {
  AccountBranded,
  MonthBranded,
  NoteBranded,
  PayeeBranded,
  TransactionBranded,
  TransactionNormal,
  TransactionTransfer,
} from "@/core/types/NormalizedData";
import {
  AccountId,
  CategoryId,
  MonthId,
  NoteId,
  PayeeId,
  TransactionId,
} from "@/pages/budget/allocation/types/types";

export type CreatedTransactionBranded =
  | {
      type: "normal";
      transaction: TransactionNormal;
    }
  | {
      type: "transfer";
      source: TransactionTransfer;
      destination: TransactionTransfer;
    };

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
    transactions: CreatedTransactionBranded;
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
  transactionId: TransactionId;
  updates: {
    accountId?: AccountId;
    date?: string;
    payeeId?: PayeeId | null;
    payeeName?: string;
    categoryId?: CategoryId;
    memo?: string;
    inflow?: string;
    outflow?: string;
    transferAccountId?: AccountId | null;
  };
};

export type EditTransactionResult = {
  created: {
    payee: Record<PayeeId, PayeeBranded>;
    months: Record<MonthId, MonthBranded>;
    memos: Record<NoteId, NoteBranded>;
    transaction: Record<TransactionId, TransactionTransfer>;
  };
  updated: {
    accounts: Record<AccountId, AccountBranded>;
    months: Record<MonthId, MonthBranded>;
    transaction: Record<TransactionId, TransactionBranded>;
  };
  deleted: {
    transaction: Record<TransactionId, TransactionTransfer>;
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
    transactions: CreatedTransactionBranded[];
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
