import { type AccountDto, type AccountId } from "../../account/account.types";
import {
  type MonthDto,
  type CategoryId,
} from "../../category/core/category.types";
import { type MemoDto } from "../../memo/memo.types";
import { type PayeeDto, type PayeeId } from "../../payee/payee.types";
import { type CreateTransactionPayload } from "../transaction.schema";
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
  DomainTransferTransaction | DomainNormalTransaction;

/**
 * Internal convenience: same as AddTransactionPayload but guarantees a concrete Date.
 */
export type InsertTransactionPayloadWithDate = Omit<
  CreateTransactionPayload,
  "date"
> & {
  date: Date;
  origin: "SYSTEM" | "USER";
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

export type TransactionNormalDto = {
  type: "normal";
  id: string;
  accountId: string;
  categoryId: string;
  payeeId: string | null;
  date: string;
  memo: string;
  inflow: number;
  outflow: number;
};

export type TransactionTransferDto = {
  type: "transfer";
  id: string;
  accountId: string;
  payeeId: string | null;
  date: string;
  memo: string;
  inflow: number;
  outflow: number;
  transferAccountId: string;
  transferTransactionId: string;
};

/**
 * Data Transfer Object representing a financial transaction as exposed to the client.
 *
 * This is the canonical representation of a transaction used for API responses
 * and frontend state hydration. It includes all fields required to render,
 * categorize, and compute financial summaries for a transaction.
 */
export type TransactionDto = TransactionNormalDto | TransactionTransferDto;

/**
 * Represents a transaction or set of transactions created by an operation.
 *
 * Supports both normal transactions and transfers. Transfers are represented
 * by their source and destination transactions to preserve the relationship
 * between both sides of the transfer.
 *
 * Supported types:
 * - `normal`: A single standard financial transaction.
 * - `transfer`: A pair of linked transactions representing the source and
 *   destination sides of a transfer.
 */
type CreatedTransactions =
  | { type: "normal"; transaction: TransactionNormalDto }
  | {
      type: "transfer";
      source: TransactionTransferDto;
      destination: TransactionTransferDto;
    };

/**
 * DTO returned after a transaction creation operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `created.transactions`:
 *   The transaction or transfer created by the operation.
 *
 * - `created.payee`:
 *   The payee created during the operation, if a new payee was provided.
 *
 * - `created.memos`:
 *   The memos created as part of the transaction operation.
 *
 * - `created.months`:
 *   Budget months created as a result of the operation.
 *
 * - `updated.accounts`:
 *   Accounts whose balances or other derived values were affected.
 *
 * - `updated.months`:
 *   Existing budget months whose aggregates were affected.
 */
export type CreateTransactionDto = {
  created: {
    transactions: CreatedTransactions;
    payee?: PayeeDto;
    memos: MemoDto[];
    months: Record<string, MonthDto>;
  };

  updated: {
    accounts: Record<string, AccountDto>;
    months: Record<string, MonthDto>;
  };
};

/**
 * DTO returned after a transaction deletion operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `updated.accounts`:
 *   Accounts whose balances or other derived values were affected.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected by the deletion.
 *
 * - `deleted.transactions`:
 *   Transactions removed by the operation, keyed by their identifiers.
 *
 * The frontend is responsible for removing the deleted transactions from
 * its local state and merging the updated accounts and months.
 */
export type DeleteTransactionsDto = {
  updated: {
    accounts: Record<string, AccountDto>;
    months: Record<string, MonthDto>;
  };
  deleted: {
    transactions: Record<string, TransactionDto>;
  };
};

/**
 * DTO returned after a transaction edit operation.
 *
 * Represents a partial state update containing the entities created or
 * updated as a result of the operation. It allows the client to reconcile
 * its local state without requiring a full budget snapshot refetch.
 *
 * Entities are grouped by operation and keyed by their identifiers to
 * facilitate efficient lookup and merging into client-side state.
 *
 * Structure:
 *
 * - `created.payee`:
 *   Payees created as a result of the operation, keyed by payee ID.
 *
 * - `created.months`:
 *   Budget months created as a result of the operation, keyed by month ID.
 *
 * - `created.memos`:
 *   Memos created as a result of the operation, keyed by memo ID.
 *
 * - `updated.accounts`:
 *   Accounts whose balances or other derived values were affected,
 *   keyed by account ID.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected, keyed by month ID.
 *
 * - `updated.transactions`:
 *   Transactions updated as a result of the operation, including transfer
 *   counterparts where applicable, keyed by transaction ID.
 *
 * The frontend is responsible for merging created and updated entities
 * into its local state, distinguishing newly created entities from
 * existing entities that require updating.
 */
export type EditTransactionDto = {
  created: {
    payee: Record<string, PayeeDto>;
    months: Record<string, MonthDto>;
    memos: Record<string, MemoDto>;
  };
  updated: {
    accounts: Record<string, AccountDto>;
    months: Record<string, MonthDto>;
    transactions: Record<string, TransactionDto>;
  };
};

/**
 * DTO returned after a transaction duplication operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `created.transactions`:
 *   The transactions created by the duplication operation. Supports both
 *   normal transactions and transfers with their source and destination
 *   counterparts.
 *
 * - `updated.accounts`:
 *   Accounts whose balances or other derived values were affected by
 *   the duplicated transactions.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected by the duplication.
 *
 * The frontend is responsible for adding the created transactions to its
 * local state and merging the updated accounts and months.
 */
export type DuplicateTransactionsDto = {
  created: {
    transactions: CreatedTransactions[];
  };

  updated: {
    accounts: Record<string, AccountDto>;
    months: Record<string, MonthDto>;
  };
};

/**
 * DTO returned after a bulk transaction update operation.
 *
 * This DTO represents a partial state update intended for client-side
 * hydration or incremental state reconciliation.
 *
 * It does not return a full snapshot of the budget state; instead, it
 * provides only the entities that were directly affected by the operation.
 *
 * Structure:
 * - `updated.transactions`:
 *   Transactions updated by the operation, keyed by their identifiers.
 *   Includes transfer counterparts where applicable.
 *
 * - `updated.accounts`:
 *   Accounts whose balances or other derived values were affected.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected.
 *
 * The frontend is responsible for merging the updated entities into its
 * local state rather than replacing the entire transaction, account, or
 * budget month collections.
 */
export type EditTransactionsBulkDto = {
  updated: {
    transactions: Record<string, TransactionDto>;
    accounts: Record<string, AccountDto>;
    months: Record<string, MonthDto>;
  };
};
