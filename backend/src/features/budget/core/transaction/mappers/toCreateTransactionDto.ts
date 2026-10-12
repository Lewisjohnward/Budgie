import { type CreateTransactionDto } from "../transaction.types";
import { type CreateTransactionResult } from "../contracts/createTransaction.contract";
import { memoMapper } from "../../memo/memo.mapper";
import { transactionMapper } from "../transaction.mapper";
import { payeeMapper } from "../../payee/payee.mapper";
import { accountMapper } from "../../account/account.mapper";
import { categoryMapper } from "../../category/core/category.mapper";

/**
 * Maps a CreateTransactionResult (domain/use-case output)
 * into a CreateTransactionDto (API response format).
 */

export const toCreateTransactionDto = (
  result: CreateTransactionResult
): CreateTransactionDto => {
  const { created, updated } = result;

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

  return {
    created: {
      result: mappedResult,
      sideEffects: {
        payee: created.payee
          ? payeeMapper.toPayeeDto(created.payee)
          : undefined,
        memos: created.memos?.map(memoMapper.toMemoDto),
      },
    },
    updated: {
      accounts: Object.fromEntries(
        Object.entries(updated.accounts).map(([id, account]) => [
          id,
          accountMapper.toAccountDto(account),
        ])
      ),
      months: updated.months
        ? Object.fromEntries(
            Object.entries(updated.months).map(([id, month]) => [
              id,
              categoryMapper.toMonthDto(month),
            ])
          )
        : undefined,
    },
  };
};
