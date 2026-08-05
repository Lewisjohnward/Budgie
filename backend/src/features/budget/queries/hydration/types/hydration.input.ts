import { type DomainAccount } from "../../../core/account/account.types";
import {
  type DomainUserCategory,
  type DomainMonth,
  type SystemCategories,
} from "../../../core/category/core/category.types";
import { type CategoryGroupsBySource } from "../../../core/categorygroup/application/service/getCategoryGroups";
import { type DomainMemo } from "../../../core/memo/memo.types";
import { type DomainPayee } from "../../../core/payee/payee.types";
import { type DomainTransaction } from "../../../core/transaction/transaction.types";

/**
 * Raw hydration payload returned from the backend before any transformation.
 *
 * This represents the unprocessed data model used as the input boundary for the
 *
 * - Acts as the source-of-truth snapshot from the backend
 */
export type HydrationRawData = {
  categoryGroups: CategoryGroupsBySource;
  userCategories: DomainUserCategory[];
  systemCategories: SystemCategories;
  months: DomainMonth[];
  accounts: DomainAccount[];
  transactions: DomainTransaction[];
  memos: DomainMemo[];
  payees: DomainPayee[];
  range: {
    from: Date;
    to: Date;
  };
};
