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
  PayeeId,
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

// Delete

// Duplicate

// Edit build
