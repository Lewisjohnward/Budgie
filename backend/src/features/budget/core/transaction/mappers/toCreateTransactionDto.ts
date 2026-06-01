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

  const transactions = created.transactions;

  const mappedResult =
    transactions.length === 1
      ? {
          type: "normal" as const,
          transaction: transactionMapper.toTransactionDto(transactions[0]),
        }
      : {
          type: "transfer" as const,
          source: transactionMapper.toTransactionDto(transactions[0]),
          destination: transactionMapper.toTransactionDto(transactions[1]),
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
