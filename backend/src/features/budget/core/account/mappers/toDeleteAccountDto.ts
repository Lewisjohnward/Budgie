import { categoryMapper } from "../../category/core/category.mapper";
import { type DeleteAccountResult } from "../account.contract";
import { accountMapper } from "../account.mapper";
import { DeleteAccountDto } from "../account.types";

export const toDeleteAccountDto = (
  result: DeleteAccountResult
): DeleteAccountDto => ({
  deleted: {
    account: accountMapper.toAccountDto(result.deletedAccount),
    transactions: Object.fromEntries(
      result.deletedTransactions.map((transaction) => [
        transaction.id,
        transaction,
      ])
    ),
  },
  updated: {
    months: Object.fromEntries(
      result.updatedMonths.map((month) => [
        month.id,
        categoryMapper.toMonthDto(month),
      ])
    ),
  },
});
