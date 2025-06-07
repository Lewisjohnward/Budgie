import { prisma } from "../../../../shared/prisma/client";
import { categoryService } from "../../category/category.service";
import { createDuplicatedTxs } from "../utils/createDuplicateTxs";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import {
  calculateRtaMonthsAvailable,
  updateRtaMonthsActivity,
} from "../domain/rta.domain";
import { updateCategoryMonthsForMutipleTransactions } from "../domain/category.domain";
import { updateAccountBalances } from "../domain/account.domain";
import { splitTransactionsByRtaCategory } from "../utils/splitTransactionsByRtaCategory";
import { OperationMode } from "../../../../shared/enums/operation-mode";

export const insertDuplicateTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  await prisma.$transaction(async (tx) => {
    const transactions = await budgetRepository.getTransactions(
      tx,
      transactionIds,
      userId,
    );
    if (transactions.length === 0) {
      throw new Error("No matching transactions found to duplicate.");
    }
    const { id: rtaCategoryId } = await categoryService.getRtaCategory(
      tx,
      userId,
    );

    const transactionsToInsert = createDuplicatedTxs(transactions);

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactions, rtaCategoryId);

    // insert txs
    await budgetRepository.createTransactions(tx, transactionsToInsert);

    // update months for duplicated transactions
    if (categorisedTransactions.length > 0) {
      await updateCategoryMonthsForMutipleTransactions(
        tx,
        categorisedTransactions,
        OperationMode.Add,
      );
    }

    // update rta activity and then recalculate rta months available
    if (rtaTransactions.length > 0) {
      await updateRtaMonthsActivity(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Add,
      );
    }

    // update account balances
    await updateAccountBalances(tx, transactions, OperationMode.Add);

    // update rta months
    await calculateRtaMonthsAvailable(tx, userId, rtaCategoryId);
  });
};
