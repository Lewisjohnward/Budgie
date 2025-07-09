import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../category/category.service";

export const createOpeningBalanceTransaction = async (
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  inflow: Decimal,
) => {
  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

  const newTransaction = await transactionRepository.createTransaction(tx, {
    accountId,
    inflow,
    categoryId: rtaCategoryId,
  });

  await categoryService.rta.updateMonthsActivityForTransactions(
    tx,
    userId,
    rtaCategoryId,
    [newTransaction],
    OperationMode.Add,
  );

  await accountService.updateAccountBalances(
    tx,
    [newTransaction],
    OperationMode.Add,
  );

  await categoryService.rta.calculateMonthsAvailable(tx, userId, rtaCategoryId);
};
