import { Prisma } from "@prisma/client";
import { payeeService } from "../../../payee/payee.service";
import { categoryService } from "../../../category/category.service";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { createNormalTransaction } from "./create/createNormalTransaction";
import {
  NormalTransactionEntity,
  NormalTransactionInsertData,
} from "../../transaction.types";

export async function insertNormalTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  transaction: NormalTransactionInsertData
): Promise<NormalTransactionEntity> {
  const {
    accountId,
    date,
    memo,
    inflow,
    outflow,
    categoryId,
    payeeId,
    payeeName,
  } = transaction;

  const resolvedPayeeId =
    payeeId !== undefined || payeeName !== undefined
      ? await payeeService.resolvePayeeId(tx, userId, payeeId, payeeName)
      : undefined;

  if (categoryId) {
    await categoryService.categories.checkUserOwnsCategory(
      tx,
      userId,
      categoryId
    );
  }

  // TODO:(lewis 2026-01-26 11:31) needs to go in service in categories
  const uncategorisedCategoryId = categoryId
    ? undefined
    : await categoryRepository.getUncategorisedCategoryId(tx, userId);

  const finalCategoryId = categoryId ?? uncategorisedCategoryId!;

  const newTransaction = await createNormalTransaction(tx, {
    accountId,
    date,
    memo,
    inflow,
    outflow,
    payeeId: resolvedPayeeId,
    categoryId: finalCategoryId,
  });

  const mode = OperationMode.Add;
  // TODO:(lewis 2025-12-28 21:03) this should be service, not repo
  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);
  const isRtaTransaction = newTransaction.categoryId === rtaCategoryId;

  // insert the missing months
  await categoryService.months.insertMissingMonths(
    tx,
    userId,
    newTransaction.date
  );

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

  return newTransaction;
}
