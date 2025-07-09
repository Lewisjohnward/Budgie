import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { TransactionsToUpdate } from "../../transaction.schema";
import { splitTransactionsByRtaCategory } from "../../utils/splitTransactionsByRtaCategory";
import { prisma } from "../../../../../shared/prisma/client";
import { deleteTransactions } from "./deleteTransactions";
import { categoryService } from "../../../category/category.service";

export const updateTransactions = async (
  userId: string,
  updatedTransactions: TransactionsToUpdate,
) => {
  if (updatedTransactions.length === 0) return;

  await prisma.$transaction(async (tx) => {
    const transactionIds = updatedTransactions.map((tx) => tx.id);

    // check that the transactions already exist in the db
    const transactionsToUpdate =
      await transactionRepository.getTransactionsById(
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
    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    // TODO: THIS NEEDS A TX
    await deleteTransactions(
      userId,
      transactionsToUpdate.map((t) => t.id),
    );

    // TODO: NEED TO VALIDATE ACCOUNT transaction is going to,
    // TODO: NEED TO CHECK USER OWNS, CATEGORY, CATEGORYMONTH
    //TODO: NEED TO UPDATE MONTHS IF MOVING INTO THE PAST

    const transactionsToInsert = filteredTxs;

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactionsToInsert, rtaCategoryId);

    // insert txs
    await transactionRepository.createTransactions(tx, transactionsToInsert);

    // update months for transactions
    if (categorisedTransactions.length > 0) {
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        categorisedTransactions,
        OperationMode.Add,
      );
    }

    // update rta activity and then recalculate rta months available
    if (rtaTransactions.length > 0) {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Add,
      );
    }

    // update account balances
    await accountService.updateAccountBalances(
      tx,
      transactionsToInsert,
      OperationMode.Add,
    );

    // update rta months
    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId,
    );
  });
};
