import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { DomainPayee } from "../../payee/payee.types";
import { type DomainTransaction } from "../transaction.types";

/**
 * Result returned from the edit transaction use case.
 *
 * Represents the domain entities created or updated by the operation,
 * allowing the API layer to construct a response that synchronises the
 * client's local state without requiring a full refetch.
 *
 * @property createdPayee - Payee created by the operation, if a new payee
 * was created.
 * @property createdMonths - Budget month aggregates created by the operation.
 * @property updatedAccounts - Accounts whose balances were affected by the
 * operation.
 * @property updatedMonths - Budget month aggregates updated by the operation.
 * @property updatedTransactions - Transactions updated by the operation,
 * including transfer counterparts where applicable.
 */
export type EditTransactionResult = {
  createdPayee?: DomainPayee;
  createdMonths: DomainMonth[];

  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainTransaction[];
};
