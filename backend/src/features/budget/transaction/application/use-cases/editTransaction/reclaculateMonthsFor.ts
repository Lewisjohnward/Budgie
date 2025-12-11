import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../../category/category.service";
import { categoryRepository } from "../../../../../../shared/repository/categoryRepositoryImpl";
import { Prisma } from "@prisma/client";
import { splitTransactionsByType } from "../../../utils/splitTransactionsByType";
import { NormalTransactionEntity } from "../../../transaction.types";

export async function recalcMonthsFor(
  tx: Prisma.TransactionClient,
  userId: string,
  txs: NormalTransactionEntity[],
  mode: OperationMode
) {
  if (txs.length === 0) return;

  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

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
