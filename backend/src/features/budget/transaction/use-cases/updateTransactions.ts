import { TransactionsToUpdate } from "../transaction.schema";
import { categoryService } from "../../category/category.service";
import { prisma } from "../../../../shared/prisma/client";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import { deleteTransactions } from "./deleteTransactions";
import { updateCategoryMonthsForMutipleTransactions } from "../domain/category.domain";
import {
  calculateRtaMonthsAvailable,
  updateRtaMonthsActivity,
} from "../domain/rta.domain";
import { updateAccountBalances } from "../domain/account.domain";
import { splitTransactionsByRtaCategory } from "../utils/splitTransactionsByRtaCategory";
import { OperationMode } from "../../../../shared/enums/operation-mode";

export const updateTransactions = async (
  userId: string,
  updatedTransactions: TransactionsToUpdate,
) => {
  if (updatedTransactions.length === 0) return;

  await prisma.$transaction(async (tx) => {
    const transactionIds = updatedTransactions.map((tx) => tx.id);

    // check that the transactions already exist in the db
    const transactionsToUpdate = await budgetRepository.getTransactions(
      tx,
      transactionIds,
      userId,
    );

    // create set of transaction ids
    const existingIds = new Set(transactionsToUpdate.map((t) => t.id));

    const filteredTxs = [...updatedTransactions]
      .filter((tx) => existingIds.has(tx.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    //
    if (filteredTxs.length === 0) return;
    const { id: rtaCategoryId } = await categoryService.getRtaCategory(
      tx,
      userId,
    );

    await deleteTransactions(
      userId,
      transactionsToUpdate.map((t) => t.id),
    );

    //TODO: insert the transactions like how you would duplicate a transaction

    // TODO: NEED TO VALIDATE ACCOUNT transaction is going to,
    // TODO: NEED TO CHECK USER OWNS, CATEGORY, CATEGORYMONTH
    //TODO: NEED TO UPDATE MONTHS IF MOVING INTO THE PAST

    const transactionsToInsert = filteredTxs;

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactionsToInsert, rtaCategoryId);

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
    await updateAccountBalances(tx, transactionsToInsert, OperationMode.Add);

    // update rta months
    await calculateRtaMonthsAvailable(tx, userId, rtaCategoryId);
  });
};
