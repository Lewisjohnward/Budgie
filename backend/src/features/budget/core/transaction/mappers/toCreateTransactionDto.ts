import { type CreateTransactionDto } from "../transaction.types";
import { type CreateTransactionResult } from "../contracts/createTransaction.contract";
import { memoMapper } from "../../memo/memo.mapper";
import { transactionMapper } from "../transaction.mapper";
import { payeeMapper } from "../../payee/payee.mapper";
import { accountMapper } from "../../account/account.mapper";
import { categoryMapper } from "../../category/core/category.mapper";

/**
 * Maps a create transaction use case result to its API response DTO.
 */
export const toCreateTransactionDto = (
  result: CreateTransactionResult
): CreateTransactionDto => {
  const {
    createdTransactions,
    createdPayee,
    createdMemos,
    createdMonths,
    updatedAccounts,
    updatedMonths,
  } = result;

  const mapCreatedTransactions = (
    transactions: CreateTransactionResult["createdTransactions"]
  ): CreateTransactionDto["created"]["transactions"] => {
    switch (transactions.type) {
      case "normal":
        return {
          type: "normal",
          transaction: transactionMapper.toTransactionNormalDto(
            transactions.transaction
          ),
        };

      case "transfer":
        return {
          type: "transfer",
          source: transactionMapper.toTransactionTransferDto(
            transactions.source
          ),
          destination: transactionMapper.toTransactionTransferDto(
            transactions.destination
          ),
        };
    }
  };

  return {
    created: {
      transactions: mapCreatedTransactions(createdTransactions),
      ...(createdPayee && {
        payee: payeeMapper.toPayeeDto(createdPayee),
      }),
      memos: createdMemos.map(memoMapper.toMemoDto),
      months: Object.fromEntries(
        createdMonths.map((month) => [
          month.id,
          categoryMapper.toMonthDto(month),
        ])
      ),
    },

    updated: {
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
