import { categoryService } from "../../category/category.service";
import { prisma } from "../../../../shared/prisma/client";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import {
  calculateRtaMonthsAvailable,
  updateRtaMonthsActivity,
} from "../domain/rta.domain";
import { updateCategoryMonthsForMutipleTransactions } from "../domain/category.domain";
import { updateAccountBalances } from "../domain/account.domain";
import { splitTransactionsByRtaCategory } from "../utils/splitTransactionsByRtaCategory";
import { OperationMode } from "../../../../shared/enums/operation-mode";

export const deleteTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  await prisma.$transaction(async (tx) => {
    if (transactionIds.length === 0) return;

    // get txs to delete
    const transactionsToDelete = await budgetRepository.getTransactions(
      tx,
      transactionIds,
      userId,
    );

    if (transactionsToDelete.length === 0) return;
    // get rta category
    // TODO: MOVE THIS into domain?
    const { id: rtaCategoryId } = await categoryService.getRtaCategory(
      tx,
      userId,
    );

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactionsToDelete, rtaCategoryId);

    // update months for deleted transactions
    if (categorisedTransactions.length > 0) {
      await updateCategoryMonthsForMutipleTransactions(
        tx,
        categorisedTransactions,
        OperationMode.Delete,
      );
    }

    // update rta activity for deleted transactions
    if (rtaTransactions.length > 0) {
      await updateRtaMonthsActivity(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Delete,
      );
    }

    // DELETE TRANSACTIONS
    await budgetRepository.deleteTransactions(tx, transactionIds, userId);

    // update account balances
    await updateAccountBalances(tx, transactionsToDelete, OperationMode.Delete);

    // update rta months
    await calculateRtaMonthsAvailable(tx, userId, rtaCategoryId);
  });
};
