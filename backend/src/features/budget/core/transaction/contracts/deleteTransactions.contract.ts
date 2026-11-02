import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainTransaction } from "../transaction.types";

/**
 * Result returned from the bulk delete transactions use case.
 *
 * Represents the domain entities updated or deleted by the operation,
 * allowing the API layer to construct a response that synchronises the
 * client's local state without requiring a full refetch.
 *
 * @property updatedAccounts - Accounts whose balances were affected by the
 * operation.
 * @property updatedMonths - Budget month aggregates updated by the operation.
 * @property deletedTransactions - Transactions deleted by the operation.
 */
export type DeleteTransactionsResult = {
  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  deletedTransactions: DomainTransaction[];
};
