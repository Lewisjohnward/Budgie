import { type MonthDto } from "../../category/core/category.types";
import {
  type DomainNormalTransaction,
  type TransactionNormalDto,
} from "../../transaction/transaction.types";
import { type AddAccountPayload } from "../account.schema";
import { type AccountType } from "../account.types";

/**
 * Payload for creating a new account, including the position index.
 */
export type CreateAccountPayloadWithPosition = AddAccountPayload & {
  position: number;
};

/**
 * Represents a user-owned account in the domain.
 * All fields are readonly to enforce immutability.
 */
export type AccountDto = Readonly<{
  id: string;
  name: string;
  position: number;
  open: boolean;
  type: AccountType;
  balance: number;
  deletable: boolean;
}>;

/**
 * DTO returned after an account creation operation.
 *
 * Structure:
 *
 * - `created.account`:
 *   The account created by the operation.
 *
 * - `created.transaction`:
 *   The initial transaction created alongside the account, if applicable.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected by the account creation,
 *   keyed by month ID.
 *
 * The frontend is responsible for adding the created account and optional
 * transaction to its local state and merging the updated months.
 */
export type CreateAccountDto = Readonly<{
  created: {
    account: AccountDto;
    transaction?: TransactionNormalDto;
  };
  updated: {
    months: Record<string, MonthDto>;
  };
}>;

/**
 * DTO returned after an account deletion operation.
 *
 * Structure:
 *
 * - `deleted.account`:
 *   The account deleted by the operation.
 *
 * - `deleted.transactions`:
 *   Transactions deleted alongside the account, keyed by transaction ID.
 *
 * - `updated.months`:
 *   Budget months whose aggregates were affected by the account deletion,
 *   keyed by month ID.
 */
export type DeleteAccountDto = Readonly<{
  deleted: {
    account: AccountDto;
    transactions: Record<string, DomainNormalTransaction>;
  };
  updated: {
    months: Record<string, MonthDto>;
  };
}>;
