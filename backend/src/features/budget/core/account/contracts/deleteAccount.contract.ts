import { type DomainMonth } from "../../category/core/category.types";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { type DomainAccount } from "../account.types";

/**
 * Represents the result of deleting an account, including the
 * account, any transactions and the updated months.
 */
export type DeleteAccountResult = {
  deletedAccount: DomainAccount;
  deletedTransactions: DomainNormalTransaction[];
  updatedMonths: DomainMonth[];
};
