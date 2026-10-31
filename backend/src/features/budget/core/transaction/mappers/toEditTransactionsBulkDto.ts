import { accountMapper } from "../../account/account.mapper";
import { categoryMapper } from "../../category/core/category.mapper";
import { type EditTransactionsResult } from "../contracts/editTransactions.contract";
import { type EditTransactionsBulkDto } from "../transaction.types";
import { toTransactionNormalDto } from "./toTransactionNormalDto";
import { toTransactionTransferDto } from "./toTransactionTransferDto";

/**
 * Maps an edit transactions use case result to its API response DTO.
 */
export const toEditTransactionsBulkDto = (
  result: EditTransactionsResult
): EditTransactionsBulkDto => {
  const { updatedAccounts, updatedMonths, updatedTransactions } = result;

  const mapUpdatedTransaction = (
    transaction: EditTransactionsResult["updatedTransactions"][number]
  ) => {
    switch (transaction.type) {
      case "normal":
        return toTransactionNormalDto(transaction);

      case "transfer":
        return toTransactionTransferDto(transaction);
    }
  };

  return {
    updated: {
      transactions: Object.fromEntries(
        updatedTransactions.map((transaction) => [
          transaction.id,
          mapUpdatedTransaction(transaction),
        ])
      ),

      accounts: Object.fromEntries(
        updatedAccounts.map((account) => [
          account.id,
          accountMapper.toAccountDto(account),
        ])
      ),

      months: Object.fromEntries(
        updatedMonths.map((month) => [
          month.id,
          categoryMapper.toMonthDto(month),
        ])
      ),
    },
  };
};
