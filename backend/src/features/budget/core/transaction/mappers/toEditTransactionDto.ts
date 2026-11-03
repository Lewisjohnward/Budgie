import { toAccountDto } from "../../account/mappers/toAccountDto";
import { toMonthDto } from "../../category/core/mappers/toMonthDto";
import { toMemoDto } from "../../memo/mappers/toUpatedMemo";
import { toPayeeDto } from "../../payee/mappers/toPayeeDto";
import { type EditTransactionResult } from "../transaction.contract";
import { type EditTransactionDto } from "../transaction.types";
import { toTransactionDto } from "./toTransactionDto";

export const toEditTransactionDto = (
  result: EditTransactionResult
): EditTransactionDto => {
  return {
    created: {
      payee: result.createdPayee
        ? {
            [result.createdPayee.id]: toPayeeDto(result.createdPayee),
          }
        : {},
      months: Object.fromEntries(
        result.createdMonths.map((month) => [month.id, toMonthDto(month)])
      ),
      memos: Object.fromEntries(
        result.createdMemos.map((memo) => [memo.id, toMemoDto(memo)])
      ),
    },
    updated: {
      accounts: Object.fromEntries(
        result.updatedAccounts.map((account) => [
          account.id,
          toAccountDto(account),
        ])
      ),
      months: Object.fromEntries(
        result.updatedMonths.map((month) => [month.id, toMonthDto(month)])
      ),
      transactions: Object.fromEntries(
        result.updatedTransactions.map((transaction) => [
          transaction.id,
          toTransactionDto(transaction),
        ])
      ),
    },
  };
};
