import { Brand } from "../../../../../shared/types/brand";
import {
  type AccountType,
  type AccountId,
  type DomainAccount,
} from "../../../core/account/account.types";
import {
  type DomainMonth,
  type CategoryId,
  type MonthId,
  type DomainUserCategory,
  type DomainSystemCategory,
} from "../../../core/category/core/category.types";
import {
  type DomainSystemCategoryGroup,
  type DomainUserCategoryGroup,
  type CategoryGroupId,
} from "../../../core/categorygroup/categoryGroup.types";
import { type DomainMemo } from "../../../core/memo/memo.types";
import { type PayeeOrigin } from "../../../core/payee/payee.constants";
import {
  type DomainPayee,
  type PayeeId,
} from "../../../core/payee/payee.types";
import {
  type DomainTransaction,
  type TransactionId,
} from "../../../core/transaction/transaction.types";

/**
 * Fully hydrated, application-ready data model used by the frontend UI layer.
 *
 * This structure represents the normalized and indexed version of raw backend
 * data after it has been processed by the hydration pipeline.
 *
 * Key characteristics:
 *
 * - Entities are indexed by their stable identifiers (Record<Id, Entity>)
 * - Includes derived structural organization (e.g. monthKeys, memosByMonth)
 *
 * Design intent:
 * - Serves as the single source of truth for UI state derived from backend data
 */
export type BudgetHydrationModel = {
  categoryGroups: {
    user: Record<CategoryGroupId, DomainUserCategoryGroup>;
    inflow: DomainSystemCategoryGroup;
    uncategorised: DomainSystemCategoryGroup;
  };
  categories: {
    user: Record<CategoryId, DomainUserCategory>;
    rta: DomainSystemCategory;
    uncategorised: DomainSystemCategory;
  };
  months: Record<MonthId, DomainMonth>;
  accounts: Record<AccountId, DomainAccount>;
  transactions: Record<TransactionId, DomainTransaction>;
  payees: Record<PayeeId, DomainPayee>;
  memosByMonth: Record<MonthKey, DomainMemo>;
  monthKeys: MonthKey[];
};

export type MonthKey = Brand<string, "MonthKey">;
export const asMonthKey = (id: string) => id as MonthKey;

export type CategoryGroup = {
  id: CategoryGroupId;
  name: string;
  position: number | null;
};

export type Transaction = {
  id: TransactionId;
  accountId: AccountId;
  categoryId?: CategoryId;
  payeeId?: PayeeId;
  date: string;
  memo: string;
  inflow: number;
  outflow: number;
};

export type Category = {
  id: CategoryId;
  name: string;
  position: number;
  categoryGroupId: CategoryGroupId;
};

export type Month = {
  id: MonthId;
  categoryId: CategoryId;
  month: string;
  activity: number;
  assigned: number;
  available: number;
};

export type Memo = {
  id: string;
  month: string;
  content: string;
};

export type Account = {
  id: string;
  name: string;
  position: number;
  open: boolean;
  type: AccountType;
  deletable: boolean;
  balance: number;
};

export type Payee = {
  id: PayeeId;
  name: string;
  origin: PayeeOrigin | null;
  defaultCategoryId: CategoryId | null;
  includeInPayeeList: boolean;
  automaticallyCategorisePayee: boolean;
};
