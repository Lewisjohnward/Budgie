import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainMemo } from "../../memo/memo.types";
import { type DomainPayee } from "../../payee/payee.types";
import { CreatedTransactions } from "../transaction.types";

/**
 * Result returned from the create transaction use case.
 *
 * Represents the domain entities created or updated by the operation,
 * allowing the API layer to construct a response that synchronises the
 * client's local state without requiring a full refetch.
 *
 * @property createdTransactions - The created normal transaction or transfer
 * pair, distinguished by transaction type.
 * @property createdPayee - Newly created payee, if applicable.
 * @property createdMemos - Newly created memos.
 * @property createdMonths - Newly created budget month aggregates.
 * @property updatedAccounts - Accounts updated by the operation.
 * @property updatedMonths - Existing budget month aggregates updated by
 * the operation.
 */
export type CreateTransactionResult = {
  createdTransactions: CreatedTransactions;
  createdPayee?: DomainPayee;
  createdMemos: DomainMemo[];
  createdMonths: DomainMonth[];

  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
};
