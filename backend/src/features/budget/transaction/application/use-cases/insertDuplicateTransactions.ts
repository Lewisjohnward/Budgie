import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { categoryService } from "../../../category/category.service";
import { createDuplicatedTxs } from "../../utils/createDuplicateTxs";
import { splitTransactionsByRtaCategory } from "../../utils/splitTransactionsByRtaCategory";

export const insertDuplicateTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  await prisma.$transaction(async (tx) => {
    const transactions = await transactionRepository.getTransactionsById(
      tx,
      transactionIds,
      userId,
    );
    if (transactions.length === 0) {
      throw new Error("No matching transactions found to duplicate.");
    }
    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    const transactionsToInsert = createDuplicatedTxs(transactions);

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactions, rtaCategoryId);

    // insert txs
    await transactionRepository.createTransactions(tx, transactionsToInsert);

    // update months for duplicated transactions
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
      transactions,
      OperationMode.Add,
    );

    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId,
    );
  });
};
