import { Prisma } from "@prisma/client";
import { payeeService } from "../../../payee/payee.service";
import { categoryService } from "../../../category/core/category.service";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { type DomainNormalTransaction } from "../../transaction.types";
import { memoService } from "../../../memo/memo.service";
import { type CreateTransactionCommand } from "../use-cases/insertTransaction";
import { DomainPayee } from "../../../payee/payee.types";
import { payeeRepository } from "../../../../../../shared/repository/payeeRepositoryImpl";
import { payeeMapper } from "../../../payee/payee.mapper";
import { accountRepository } from "../../../../../../shared/repository/accountRepositoryImpl";
import { DomainAccount } from "../../../account/account.types";
import { accountMapper } from "../../../account/account.mapper";
import { DomainMonth } from "../../../category/core/category.types";
import { DomainMemo } from "../../../memo/memo.types";
import { transactionService } from "../../transaction.service";

/**
 * Creates a normal (non-transfer) transaction and applies its associated
 * domain side effects within the provided Prisma transaction.
 *
 * Resolves the payee and category, creates any missing budget months and
 * memos, recalculates affected category and RTA months, and updates the
 * account balance and deletable status.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param command - Transaction data, including the account, date, amount,
 * category, and optional payee information.
 *
 * @returns The created transaction, updated account, optional newly created
 * payee, newly created budget months and memos, and updated budget months.
 *
 * @throws If the account or category is invalid, payee resolution fails, or
 * any database operation or domain calculation fails.
 */
export async function createNormalTransaction(
  tx: Prisma.TransactionClient,
  command: CreateTransactionCommand & {
    transferAccountId?: undefined;
  }
): Promise<{
  transaction: DomainNormalTransaction;
  account: DomainAccount;
  payee?: DomainPayee;
  createdMonths: DomainMonth[];
  updatedMonths: DomainMonth[];
  memos: DomainMemo[];
}> {
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

  let createdPayee: DomainPayee | undefined;
  if (payeeName && resolvedPayeeId !== undefined) {
    const row = await payeeRepository.getPayeeByIdAndUserId(
      tx,
      resolvedPayeeId,
      userId
    );
    if (!row) {
      throw new Error("there should be a payee id!");
    }

    createdPayee = payeeMapper.toDomainPayee(row);
  }

  if (categoryId) {
    await categoryService.categories.getCategory(tx, userId, categoryId);
  }

  // TODO:(lewis 2026-01-26 11:31) needs to go in service in categories //
  const uncategorisedCategoryId = categoryId
    ? undefined
    : await categoryService.categories.getUncategorisedCategoryId(tx, userId);

  const finalCategoryId = categoryId ?? uncategorisedCategoryId!;

  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const newTransaction = await transactionService.insertNormalTransaction(tx, {
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
  const createdMonths = await categoryService.months.insertMissingMonths(
    tx,
    userId,
    newTransaction.date
  );

  // insert the missing memos
  const createdMemos = await memoService.insertMissingMemos(
    tx,
    userId,
    newTransaction.date
  );

  let updatedCategoryMonths: DomainMonth[] = [];
  if (!isRtaTransaction) {
    updatedCategoryMonths =
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

  const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
    tx,
    userId,
    rtaCategoryId
  );

  await accountService.refreshDeletableStatus(tx, [accountId]);

  const accRow = await accountRepository.getAccount(tx, accountId, userId);
  if (!accRow) throw new Error("where is the account?");
  const account = accountMapper.toDomainAccount(accRow);

  return {
    transaction: newTransaction,
    account,
    payee: createdPayee,
    createdMonths,
    updatedMonths: [...updatedCategoryMonths, ...updatedRtaMonths],
    memos: createdMemos,
  };
}
