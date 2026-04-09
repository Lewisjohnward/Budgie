import { type Decimal } from "@prisma/client/runtime/library";
import { Brand } from "../../../../shared/types/brand";
import { type AccountId } from "../../account/account.types";
import { type CategoryId } from "../../category/core/category.types";
import { PayeeId } from "../../payee/payee.types";

/**
 * A strongly-typed identifier for a transaction, using a branded type for type safety.
 */
export type TransactionId = Brand<string, "TransactionId">;

/**
 * A type-casting function to treat a raw string as a `TransactionId`.
 * Use with caution, as it does not perform any validation.
 * @param id The raw string ID.
 * @returns The ID cast as a `TransactionId`.
 */
export const asTransactionId = (id: string) => id as TransactionId;

/**
 * Represents a standard transaction that affects a single account and is assigned to a category.
 * This is the domain model for a regular expense or income.
 */
export type DomainNormalTransaction = {
  type: "normal";
  id: TransactionId;
  accountId: AccountId;
  categoryId: CategoryId;
  payeeId?: PayeeId;
  date: Date;
  memo: string;
  inflow: Decimal;
  outflow: Decimal;
};

/**
 * Represents a transfer transaction, which involves two accounts.
 * It is linked to a corresponding transfer transaction in the other account.
 * Transfers do not have categories.
 */
export type DomainTransferTransaction = {
  type: "transfer";
  id: TransactionId;
  accountId: AccountId;
  payeeId?: PayeeId;
  date: Date;
  memo: string;
  inflow: Decimal;
  outflow: Decimal;
  transferAccountId: AccountId;
  transferTransactionId: TransactionId;
};

/**
 * A union type representing any kind of transaction in the domain,
 * which can be either a normal transaction or a transfer.
 */
export type DomainTransaction =
  | DomainNormalTransaction
  | DomainTransferTransaction;

/**
 * A base type for transfer transactions, containing common fields.
 * It explicitly excludes `categoryId` as transfers are not categorized.
 */
type DomainTransferBase = Omit<
  DomainTransaction,
  "categoryId" | "transferAccountId" | "transferTransactionId"
> & {
  // no category in domain
  categoryId?: never;
  transferAccountId: AccountId;
};

/**
 * Represents the source side of a transfer transaction *before* it has been fully created.
 * At this stage, it does not yet have a `transferTransactionId` linking it to its destination pair.
 * This type is primarily used during the creation process.
 */
export type DomainTransferSourceTransaction = DomainTransferBase & {
  // source transfers have not yet been given a
  // transferTransactionId
  transferTransactionId?: never;
};

/**
 * Represents the destination side of a transfer transaction.
 * It includes the `transferTransactionId` which links it back to the source transaction.
 */
export type DomainTransferDestinationTransaction = DomainTransferBase & {
  transferTransactionId: TransactionId;
};
