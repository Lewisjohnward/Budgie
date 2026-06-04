import { accountMapper } from "../../../core/account/account.mapper";
import { categoryMapper } from "../../../core/category/core/category.mapper";
import { categoryGroupMapper } from "../../../core/categorygroup/categorygroup.mapper";
import { memoMapper } from "../../../core/memo/memo.mapper";
import { payeeMapper } from "../../../core/payee/payee.mapper";
import { transactionMapper } from "../../../core/transaction/transaction.mapper";
import {
  type BudgetHydrationModel,
  type BudgetHydrationDto,
} from "../hydration.types";

export const toBudgetHydrationDto = (
  model: BudgetHydrationModel
): BudgetHydrationDto => ({
  categoryGroups: {
    user: Object.fromEntries(
      Object.entries(model.categoryGroups.user).map(([id, group]) => [
        id,
        categoryGroupMapper.toCategoryGroupUserDto(group),
      ])
    ),

    inflow: categoryGroupMapper.toCategoryGroupSystemDto(
      model.categoryGroups.inflow
    ),

    uncategorised: categoryGroupMapper.toCategoryGroupSystemDto(
      model.categoryGroups.uncategorised
    ),
  },

  categories: {
    user: Object.fromEntries(
      Object.entries(model.categories.user).map(([id, category]) => [
        id,
        categoryMapper.toCategoryDto(category),
      ])
    ),

    rta: categoryMapper.toCategoryDto(model.categories.rta),

    uncategorised: categoryMapper.toCategoryDto(model.categories.uncategorised),
  },

  months: Object.fromEntries(
    Object.entries(model.months).map(([id, month]) => [
      id,
      categoryMapper.toMonthDto(month),
    ])
  ),

  accounts: Object.fromEntries(
    Object.entries(model.accounts).map(([id, account]) => [
      id,
      accountMapper.toAccountDto(account),
    ])
  ),

  transactions: Object.fromEntries(
    Object.entries(model.transactions).map(([id, transaction]) => [
      id,
      transactionMapper.toTransactionDto(transaction),
    ])
  ),

  payees: Object.fromEntries(
    Object.entries(model.payees).map(([id, payee]) => [
      id,
      payeeMapper.toPayeeDto(payee),
    ])
  ),

  memosByMonth: Object.fromEntries(
    Object.entries(model.memosByMonth).map(([monthKey, memo]) => [
      monthKey,
      memoMapper.toMemoDto(memo),
    ])
  ),

  monthKeys: model.monthKeys,
});
