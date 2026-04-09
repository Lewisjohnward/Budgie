import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../../category/core/category.service";
import { Prisma } from "@prisma/client";
import { splitTransactionsByType } from "../../../utils/splitTransactionsByType";
import { type DomainNormalTransaction } from "../../../transaction.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Recalculates category month state and RTA activity for a set of normal transactions.
 *
 * This function applies updates to category months and RTA (Ready-To-Assign) months
 * based on the provided transactions and operation mode.
 *
 * Behaviour:
 * - Splits transactions into RTA and non-RTA categories.
 * - Recalculates category month aggregates for non-RTA transactions.
 * - Updates activity for RTA transactions.
 * - Recomputes available months for the RTA category, since it depends on global state.
 *
 * All operations are executed within the provided Prisma transaction, ensuring atomicity.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param userId - ID of the user who owns the transactions.
 * @param txs - Array of normal (non-transfer) transactions to recalculate months for.
 * @param mode - Operation mode indicating whether to add or remove the effects of these transactions.
 *
 * @returns A promise that resolves once all month recalculations and RTA updates are complete.
 */
export async function recalcMonthsFor(
  tx: Prisma.TransactionClient,
  userId: UserId,
  txs: DomainNormalTransaction[],
  mode: OperationMode
): Promise<void> {
  if (txs.length === 0) return;

  const rtaCategoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const { nonRtaTransactions, rtaTransactions } = splitTransactionsByType(
    txs,
    rtaCategoryId
  );

  if (nonRtaTransactions.length) {
    await categoryService.months.recalculateCategoryMonthsForTransactions(
      tx,
      nonRtaTransactions,
      mode
    );
  }

  if (rtaTransactions.length) {
    await categoryService.rta.updateMonthsActivityForTransactions(
      tx,
      userId,
      rtaCategoryId,
      rtaTransactions,
      mode
    );
  }

  // RTA available depends on global state, so do it after any month changes
  await categoryService.rta.calculateMonthsAvailable(tx, userId, rtaCategoryId);
}
