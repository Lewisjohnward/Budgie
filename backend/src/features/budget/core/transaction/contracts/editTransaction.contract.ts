import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainMemo } from "../../memo/memo.types";
import { type DomainPayee } from "../../payee/payee.types";
import {
  type DomainTransferTransaction,
  type DomainTransaction,
} from "../transaction.types";

/**
 * Result returned by the edit transaction use case.
 *
 * Represents the domain entities created, updated, or deleted as a result
 * of the operation. Allows the API layer to construct a partial state update
 * so the client can reconcile its local state without requiring a full
 * budget snapshot refetch.
 *
 * Entities are grouped by operation, with collections used where multiple
 * entities may be affected.
 *
 * @property createdTransaction - Transfer counterpart transaction created
 * by the operation, if applicable.
 * @property deletedTransaction - Existing transfer counterpart transaction
 * deleted by the operation, if applicable.
 * @property createdPayee - Payee created by the operation, if a new payee
 * was required.
 * @property createdMonths - Budget months created as a result of the operation.
 * @property createdMemos - Memos created as a result of the operation.
 * @property updatedAccounts - Accounts whose balances or other derived values
 * were affected by the operation.
 * @property updatedMonths - Budget months whose aggregates were affected
 * by the operation.
 * @property updatedTransaction - Main transaction updated by the operation.
 */
export type EditTransactionResult = {
  createdTransaction?: DomainTransferTransaction;
  deletedTransaction?: DomainTransferTransaction;

  createdPayee?: DomainPayee;
  createdMonths: DomainMonth[];
  createdMemos: DomainMemo[];

  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  updatedTransaction: DomainTransaction;
};
