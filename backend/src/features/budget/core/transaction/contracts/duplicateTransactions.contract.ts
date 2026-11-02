import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { CreatedTransactions } from "../transaction.types";

/**
 * Result returned from the duplicate transactions use case.
 *
 * Represents the domain entities created or updated by the operation,
 * allowing the API layer to construct a response that synchronises the
 * client's local state without requiring a full refetch.
 *
 * @property createdTransactions - The created normal transactions or
 * transfer pairs.
 * @property updatedAccounts - Accounts whose balances were affected by
 * the operation.
 * @property updatedMonths - Budget month aggregates updated by the operation.
 */
export type DuplicateTransactionsResult = {
  createdTransactions: CreatedTransactions[];
  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
};
