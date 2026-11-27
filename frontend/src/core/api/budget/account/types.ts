import {
  AccountBranded,
  MonthBranded,
  TransactionNormal,
} from "@/core/types/NormalizedData";
import { MonthId, TransactionId } from "@/pages/budget/allocation/types/types";

// Create
export type CreateAccountInput = {
  name: string;
  type: "BANK" | "CREDIT_CARD";
  balance: number;
};

export type CreateAccountResult = {
  created: {
    account: AccountBranded;
    transaction?: TransactionNormal;
  };
  updated: {
    months: Record<MonthId, MonthBranded>;
  };
};

export type DeleteAccountResult = {
  deleted: {
    account: AccountBranded;
    transactions: Record<TransactionId, TransactionNormal>;
  };
  updated: {
    months: Record<MonthId, MonthBranded>;
  };
};
