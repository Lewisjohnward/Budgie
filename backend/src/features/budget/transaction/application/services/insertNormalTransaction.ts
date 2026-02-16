import { Prisma } from "@prisma/client";
import { payeeService } from "../../../payee/payee.service";
import { categoryService } from "../../../category/category.service";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { createNormalTransaction } from "./create/createNormalTransaction";
import { type DomainNormalTransaction } from "../../transaction.types";
import { memoService } from "../../../memo/memo.service";
import { type InsertTransactionCommand } from "../use-cases/insertTransaction";

/**
 * Inserts a **normal (non-transfer)** transaction for a user, handling all
 * associated domain logic including payee resolution, category assignment,
 * month creation, memo creation, and account balance updates.
 *
 * Behaviour:
 * - Resolves the `payeeId` from either an existing payee or `payeeName`.
 * - Validates the category if provided; defaults to the "Uncategorised" category otherwise.
 * - Creates the transaction in the database via `createNormalTransaction`.
 * - Inserts missing category months for the transaction date.
 * - Inserts missing memos for the transaction date.
 * - Updates category month allocations or RTA month activity depending on the category.
 * - Updates account balances to reflect the new transaction.
 * - Recalculates RTA months availability if relevant.
 *
 * Domain invariants:
 * - Normal transactions must belong to a valid category (resolved to Uncategorised if none provided).
 * - Transactions must reference a valid account owned by the user.
 * - All side-effects are applied within the provided Prisma transaction to ensure atomicity.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param userId - The ID of the user creating the transaction.
 * @param transaction - Normal transaction data to insert, including optional payee and category information.
 *
 * @returns The newly created `DomainNormalTransaction`, fully mapped to domain types.
 *
 * @throws Will throw an error if:
 * - The account does not exist or is not owned by the user.
 * - The category does not exist or is not owned by the user.
 * - Any of the payee resolution, month insertion, or balance updates fail.
 */
export async function insertNormalTransaction(
  tx: Prisma.TransactionClient,
  command: InsertTransactionCommand & {
    transferAccountId?: undefined;
  }
): Promise<DomainNormalTransaction> {
  const {
    userId,
    accountId,
    date,
    memo,
    inflow,
    outflow,
    categoryId,
    payeeId,
    payeeName,
    origin,
    // remove type
    type: _type,
  } = command;

  const resolvedPayeeId =
    payeeId !== undefined || payeeName !== undefined
      ? await payeeService.resolvePayeeId(tx, userId, payeeId, payeeName)
      : undefined;

  if (categoryId) {
    await categoryService.categories.getCategory(tx, userId, categoryId);
  }

  // TODO:(lewis 2026-01-26 11:31) needs to go in service in categories //
  const uncategorisedCategoryId = categoryId
    ? undefined
    : await categoryService.categories.getUncategorisedCategoryId(tx, userId);

  const finalCategoryId = categoryId ?? uncategorisedCategoryId!;

  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const newTransaction = await createNormalTransaction(tx, {
    accountId,
    date,
    memo,
    inflow,
    outflow,
    payeeId: resolvedPayeeId,
    categoryId: finalCategoryId,
    origin,
  });

  const mode = OperationMode.Add;
  const isRtaTransaction = newTransaction.categoryId === rtaCategoryId;

  // insert the missing months
  await categoryService.months.insertMissingMonths(
    tx,
    userId,
    newTransaction.date
  );

  // insert the missing memos
  await memoService.insertMissingMemos(tx, userId, newTransaction.date);

  if (!isRtaTransaction) {
    await categoryService.months.recalculateCategoryMonthsForTransactions(
      tx,
      [newTransaction],
      mode
    );
  } else {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      [newTransaction],
      mode
    );
  }

  await accountService.updateAccountBalances(tx, [newTransaction], mode);

  await categoryService.rta.calculateMonthsAvailable(tx, userId, rtaCategoryId);

  await accountService.refreshDeletableStatus(tx, [accountId]);

  return newTransaction;
}
