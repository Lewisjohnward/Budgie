import { type AccountId } from "../../account/account.types";
import { type CategoryId } from "../../category/category.types";
import { type PayeeId } from "../../payee/payee.types";
import { type InsertTransactionPayload } from "../transaction.schema";
import {
  type DomainNormalTransaction,
  type DomainTransferTransaction,
} from "./transaction.domain";

/**
 * Represents a transaction record ready for insertion into the database.
 *
 * This union type is used when creating or duplicating transactions and
 * ensures that only valid, domain-safe transactions can be inserted.
 *
 * - **DomainNormalTransaction**: A regular transaction assigned to a category,
 *   not part of a transfer.
 * - **DomainTransferTransaction**: A transfer transaction linking two accounts,
 *   containing both `transferAccountId` and `transferTransactionId`.
 *
 * This type abstracts over normal vs transfer transactions for bulk inserts
 * or duplication operations, allowing the repository layer to handle both consistently.
 */
export type TransactionInsertData =
  | DomainTransferTransaction
  | DomainNormalTransaction;

/**
 * Internal convenience: same as AddTransactionPayload but guarantees a concrete Date.
 */
export type InsertTransactionPayloadWithDate = Omit<
  InsertTransactionPayload,
  "date"
> & {
  date: Date;
};

/**
 * Data structure for creating a normal (non-transfer) transaction.
 * Normal transactions must have a valid categoryId and date.
 */
export type NormalTransactionCreateData = Omit<
  InsertTransactionPayloadWithDate,
  "userId" | "categoryId"
> & {
  categoryId: CategoryId;
};

/**
 * Insert input for a normal transaction: guarantees date is present.
 * categoryId can still be optional because you resolve it to uncategorised in the service.
 */
export type NormalTransactionInsertData = Omit<
  InsertTransactionPayloadWithDate,
  "categoryId"
> & {
  categoryId?: CategoryId;
  payeeId?: PayeeId;
};

/**
 * Insert input for a transfer transaction: guarantees transferAccountId + date are present.
 */
export type TransferTransactionInsertData = Omit<
  InsertTransactionPayloadWithDate,
  "transferAccountId"
> & {
  transferAccountId: AccountId;
};
