import { toAccountDto } from "../../account/mappers/toAccountDto";
import { toMonthDto } from "../../category/core/mappers/toMonthDto";
import { type DeleteTransactionsResult } from "../transaction.contract";
import { type DeleteTransactionsDto } from "../transaction.types";
import { toTransactionDto } from "./toTransactionDto";

export const toDeleteTransactionsDto = (
  result: DeleteTransactionsResult
): DeleteTransactionsDto => {
  return {
    updated: {
      accounts: Object.fromEntries(
        result.updatedAccounts.map((account) => {
          const dto = toAccountDto(account);
          return [dto.id, dto];
        })
      ),
      months: Object.fromEntries(
        result.updatedMonths.map((month) => {
          const dto = toMonthDto(month);
          return [dto.id, dto];
        })
      ),
    },
    deleted: {
      transactions: Object.fromEntries(
        result.deletedTransactions.map((transaction) => {
          const dto = toTransactionDto(transaction);
          return [dto.id, dto];
        })
      ),
    },
  };
};
