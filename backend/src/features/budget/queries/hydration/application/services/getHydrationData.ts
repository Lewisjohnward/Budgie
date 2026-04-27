import { type UserId } from "../../../../../user/auth/auth.types";
import { accountService } from "../../../../core/account/account.service";
import { categoryService } from "../../../../core/category/core/category.service";
import { categoryGroupService } from "../../../../core/categorygroup/categoryGroup.service";
import { memoService } from "../../../../core/memo/memo.service";
import { payeeService } from "../../../../core/payee/payee.service";
import { transactionService } from "../../../../core/transaction/transaction.service";
import { type HydrationRawData } from "../../types/hydration.input";
import { getMonthRange } from "../../utils/getMonthRange";
import { type HydrationDateRange } from "../../utils/hydrationDateRange";

/**
 * Retrieves all raw budget data required to build the initial hydration snapshot for a user.
 *
 * This includes category structure, monthly budget data, accounts, transactions, memos, and payees
 * within the specified date range. The data is fetched in parallel and returned in a single
 * aggregated structure for downstream normalisation and hydration.
 *
 * @param userId - ID of the user whose budget data is being retrieved
 * @param fetchRange - Date range used to scope time-based entities such as months and transactions
 *
 * @returns Aggregated raw budget data required to construct the hydration snapshot
 */
export const getHydrationData = async (
  userId: UserId,
  fetchRange: HydrationDateRange
): Promise<HydrationRawData> => {
  const accounts = await accountService.getAccounts(userId);
  const accountIds = accounts.map((a) => a.id);

  const transactionsPromise = transactionService.getTransactionsByAccountIds(
    accountIds,
    fetchRange
  );
  const categoryGroupsPromise = categoryGroupService.getCategoryGroups(userId);
  const categoriesPromise = categoryService.categories.getCategories(userId);
  const monthsPromise = categoryService.months.getMonths(userId, fetchRange);
  const memosPromise = memoService.getMemos(userId);
  const payeesPromise = payeeService.getPayees(userId);

  const [categoryGroups, categories, months, transactions, memos, payees] =
    await Promise.all([
      categoryGroupsPromise,
      categoriesPromise,
      monthsPromise,
      transactionsPromise,
      memosPromise,
      payeesPromise,
    ]);

  const range = getMonthRange(memos);

  return {
    categoryGroups,
    categories,
    months,
    accounts,
    transactions,
    memos,
    payees,
    range,
  };
};
