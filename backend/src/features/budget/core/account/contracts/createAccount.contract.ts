import { type DomainMonth } from "../../category/core/category.types";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { type DomainAccount } from "../account.types";

/**
 * Represents the result of creating an account, including the newly created
 * account and any transaction created as part of the operation.
 */
export type CreateAccountResult = {
  createdAccount: DomainAccount;
  createdTransaction?: DomainNormalTransaction;
  updatedMonths: DomainMonth[];
};
