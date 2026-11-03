import { toAccountDto } from "../../account/mappers/toAccountDto";
import { toMonthDto } from "../../category/core/mappers/toMonthDto";
import type { DuplicateTransactionsResult } from "../contracts/duplicateTransactions.contract";
import type { DuplicateTransactionsDto } from "../transaction.types";
import { toTransactionNormalDto } from "./toTransactionNormalDto";
import { toTransactionTransferDto } from "./toTransactionTransferDto";

export const toDuplicateTransactionsDto = (
  result: DuplicateTransactionsResult
): DuplicateTransactionsDto => {
  return {
    created: {
      transactions: result.createdTransactions.map((transaction) => {
        if (transaction.type === "normal") {
          return {
            type: "normal",
            transaction: toTransactionNormalDto(transaction.transaction),
          };
        }

        return {
          type: "transfer",
          source: toTransactionTransferDto(transaction.source),
          destination: toTransactionTransferDto(transaction.destination),
        };
      }),
    },
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
  };
};
