import { type DomainAccount } from "../../account/account.types";
import { type DomainMonth } from "../../category/core/category.types";
import { type DomainTransaction } from "../transaction.types";

export type EditTransactionsResult = {
  updatedAccounts: DomainAccount[];
  updatedMonths: DomainMonth[];
  updatedTransactions: DomainTransaction[];
};
