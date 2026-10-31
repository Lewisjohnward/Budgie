import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainTransaction } from "../transaction.types";

/**
 * Result returned from the bulk edit transactions use case.
 *
 * Represents the domain entities updated by the operation, allowing the API
 * layer to construct a response that synchronises the client's local state
 * without requiring a full refetch.
 *
 * @property updatedTransactions - Transactions updated by the operation,
 * including transfer counterparts where applicable.
 * @property updatedAccounts - Accounts whose balances were affected by the
 * operation.
 * @property updatedMonths - Budget month aggregates updated by the operation.
 */
export type EditTransactionsResult = {
  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainTransaction[];
};
