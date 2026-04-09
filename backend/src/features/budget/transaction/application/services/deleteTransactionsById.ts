import { Prisma } from "@prisma/client";
import { UserId } from "../../../../user/auth/auth.types";
import { TransactionId } from "../../transaction.types";
import { transactionService } from "../../transaction.service";
import { categoryService } from "../../../category/core/category.service";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { getUniqueAccountIds } from "../../utils/getUniqueAccountIds";

/**
 * Deletes transactions (including transfer pairs) and updates all related derived state.
 *
 * This function contains the core domain logic for transaction deletion. It:
 *
 * 1. Resolves the full set of transactions to delete, including transfer pairs
 * 2. Splits normal transactions into:
 *    - RTA (Ready To Assign)
 *    - Non-RTA (regular category transactions)
 * 3. Updates derived category state:
 *    - Recalculates category months for non-RTA transactions
 *    - Updates RTA activity and recalculates available amounts
 * 4. Deletes all transactions from the database
 * 5. Updates account balances to reflect the removal of transactions
 * 6. Refreshes account deletable status based on updated usage
 *
 * This function must be executed within an existing Prisma transaction.
 *
 * @param tx - Prisma transaction client used to ensure atomicity
 * @param userId - ID of the user who owns the transactions
 * @param transactionIds - IDs of the transactions to delete
 *
 * @returns A promise that resolves once deletion and all related updates are complete
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if none of the provided transaction IDs can be resolved
 */
export const deleteTransactionsById = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  transactionIds: TransactionId[]
) => {
  const { normalTransactions, allTransferTransactions } =
    await transactionService.getTransactionsWithPairs(
      tx,
      userId,
      transactionIds
    );

  if (normalTransactions.length > 0) {
    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
      normalTransactions,
      rtaCategoryId
    );

    // update months for deleted transactions
    if (nonRtaTransactions.length > 0) {
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        nonRtaTransactions,
        OperationMode.Delete
      );
    }

    // update rta activity for deleted transactions
    if (rtaTransactions.length > 0) {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Delete
      );
    }

    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );
  }

  const allTransactionIds = [
    ...normalTransactions,
    ...allTransferTransactions,
  ].map((tx) => tx.id);

  await transactionRepository.deleteTransactions(tx, allTransactionIds, userId);

  await accountService.updateAccountBalances(
    tx,
    [...normalTransactions, ...allTransferTransactions],
    OperationMode.Delete
  );

  await accountService.refreshDeletableStatus(
    tx,
    getUniqueAccountIds([...normalTransactions, ...allTransferTransactions])
  );
};
