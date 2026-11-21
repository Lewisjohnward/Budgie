import { toMonthDto } from "../../category/core/mappers/toMonthDto";
import { toTransactionNormalDto } from "../../transaction/mappers/toTransactionNormalDto";
import { type CreateAccountResult } from "../account.contract";
import { type CreateAccountDto } from "../account.types";
import { toAccountDto } from "./toAccountDto";

/**
 * Maps an account creation result into its API response DTO.
 *
 * Converts the created account, optional opening balance transaction,
 * and any updated budget months into their respective DTO representations.
 *
 * @param result - The result of the account creation use case.
 * @returns The account creation response DTO.
 */
export const toCreateAccountDto = (
  result: CreateAccountResult
): CreateAccountDto => {
  const { createdAccount, createdTransaction, updatedMonths } = result;

  return {
    created: {
      account: toAccountDto(createdAccount),
      ...(createdTransaction && {
        transaction: toTransactionNormalDto(createdTransaction),
      }),
    },
    updated: {
      months: Object.fromEntries(
        updatedMonths.map((month) => [month.id, toMonthDto(month)])
      ),
    },
  };
};
