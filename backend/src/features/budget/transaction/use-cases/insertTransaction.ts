import { TransactionPayload } from "../transaction.schema";
import { categoryService } from "../../category/category.service";
import { prisma } from "../../../../shared/prisma/client";
import { validateTransaction } from "../domain/validation.domain";
import {
  insertMissingMonths,
  updateCategoryMonthsForMutipleTransactions,
} from "../domain/category.domain";
import {
  calculateRtaMonthsAvailable,
  updateRtaMonthsActivity,
} from "../domain/rta.domain";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import { updateAccountBalances } from "../domain/account.domain";
import { OperationMode } from "../../../../shared/enums/operation-mode";

//TODO: THIS NEEDS FIXING
export const insertTransaction = async (
  userId: string,
  transaction: TransactionPayload,
) => {
  const { accountId } = transaction;
  // TODO: check that if a categoryId is given it exists to prevent bug
  // TODO: NEED TO CHECK THAT THE USER OWNS THE CATEGORYID
  // TODO: NEED TO CHECK USER OWNS THE ACCOUNT

  await prisma.$transaction(async (tx) => {
    validateTransaction(transaction);

    const uncategorisedCategoryId = await budgetRepository.getUncategorisedCategoryId(tx, userId);

    const rtaCategoryId = await budgetRepository.getRtaCategoryId(tx, userId);

    const newTransaction = await budgetRepository.createTransaction(tx, {
      ...transaction,
      categoryId: transaction.categoryId ?? uncategorisedCategoryId,
    });

    const isRtaTransaction = newTransaction.categoryId === rtaCategoryId;

    // insert the missing months
    await insertMissingMonths(tx, userId, newTransaction.date);

    if (!isRtaTransaction) {
      await updateCategoryMonthsForMutipleTransactions(
        tx,
        [newTransaction],
        OperationMode.Add,
      );
    } else {
      await updateRtaMonthsActivity(
        tx,
        userId,
        rtaCategoryId,
        [newTransaction],
        OperationMode.Add,
      );
    }

    await updateAccountBalances(tx, [newTransaction], OperationMode.Add);

    await calculateRtaMonthsAvailable(tx, userId, rtaCategoryId);
  });
};
