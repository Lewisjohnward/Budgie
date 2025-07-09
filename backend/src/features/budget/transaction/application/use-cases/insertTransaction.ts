import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { categoryService } from "../../../category/category.service";
import { validateTransaction } from "../../domain/validation.domain";
import { TransactionPayload } from "../../transaction.schema";

export const insertTransaction = async (
  userId: string,
  transaction: TransactionPayload,
) => {
  const { accountId, categoryId } = transaction;

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);

    if (categoryId) {
      await categoryService.categories.checkUserOwnsCategory(
        tx,
        userId,
        categoryId,
      );
    }

    validateTransaction(transaction);

    const uncategorisedCategoryId =
      await categoryRepository.getUncategorisedCategoryId(tx, userId);

    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    const newTransaction = await transactionRepository.createTransaction(tx, {
      ...transaction,
      accountId: account.id,
      categoryId: transaction.categoryId ?? uncategorisedCategoryId,
    });

    const isRtaTransaction = newTransaction.categoryId === rtaCategoryId;

    // insert the missing months
    await categoryService.months.insertMissingMonths(
      tx,
      userId,
      newTransaction.date,
    );

    if (!isRtaTransaction) {
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        [newTransaction],
        OperationMode.Add,
      );
    } else {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        [newTransaction],
        OperationMode.Add,
      );
    }

    await accountService.updateAccountBalances(
      tx,
      [newTransaction],
      OperationMode.Add,
    );

    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId,
    );
  });
};
