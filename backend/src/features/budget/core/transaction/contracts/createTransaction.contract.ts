import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainMemo } from "../../memo/memo.types";
import { type DomainPayee } from "../../payee/payee.types";
import { type DomainTransaction } from "../../transaction/transaction.types";

/**
 * Result returned from the create transaction use case.
 *
 * This represents a snapshot of all domain-side effects produced by the operation,
 * including newly created entities and any updated aggregates.
 *
 * It is designed for frontend synchronization, allowing the client to update its
 * local state without requiring a full refetch of all data.
 *
 * @property created - Entities created as a direct result of the transaction.
 * @property created.transactions - Newly created transactions (normal or transfer).
 * @property created.payees - Newly created payees, if the transaction resulted in a new payee.
 * @property created.memos - Newly created memos, if missing month memo records were inserted.
 *
 * @property updated - Existing aggregates modified by the operation.
 * @property updated.accounts - Updated account state keyed by account ID.
 * @property updated.months - Updated month/category aggregates keyed by month ID, if applicable.
 */
export type CreateTransactionResult = {
  created: {
    transactions: DomainTransaction[];
    payee?: DomainPayee;
    memos?: DomainMemo[];
  };

  updated: {
    accounts: Record<string, DomainAccount>;
    months?: Record<string, DomainMonth>;
  };
};
