import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { splitTransactionsByRtaCategory } from "../../utils/splitTransactionsByRtaCategory";
import { categoryService } from "../../../category/category.service";

export const deleteTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  await prisma.$transaction(async (tx) => {
    if (transactionIds.length === 0) return;

    // get txs to delete
    const transactionsToDelete =
      await transactionRepository.getTransactionsById(
        tx,
        transactionIds,
        userId,
      );

    if (transactionsToDelete.length === 0) return;
    // get rta category
    // TODO: MOVE THIS into domain?
    const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

    const { rtaTransactions, categorisedTransactions } =
      splitTransactionsByRtaCategory(transactionsToDelete, rtaCategoryId);

    // update months for deleted transactions
    if (categorisedTransactions.length > 0) {
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        categorisedTransactions,
        OperationMode.Delete,
      );
    }

    // update rta activity for deleted transactions
    if (rtaTransactions.length > 0) {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Delete,
      );
    }

    // DELETE TRANSACTIONS
    await transactionRepository.deleteTransactions(tx, transactionIds, userId);

    // update account balances
    await accountService.updateAccountBalances(
      tx,
      transactionsToDelete,
      OperationMode.Delete,
    );

    // update rta months
    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId,
    );
  });
};
