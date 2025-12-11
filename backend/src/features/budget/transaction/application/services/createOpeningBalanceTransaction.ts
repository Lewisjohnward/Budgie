import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { categoryService } from "../../../category/category.service";
import { createNormalTransaction } from "./create/createNormalTransaction";

export const createOpeningBalanceTransaction = async (
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  inflow: Decimal
) => {
  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);

  const date = new Date();
  const newTransaction = await createNormalTransaction(tx, {
    accountId,
    date,
    inflow,
    categoryId: rtaCategoryId,
  });

  await categoryService.rta.updateMonthsActivityForTransactions(
    tx,
    userId,
    rtaCategoryId,
    [newTransaction],
    OperationMode.Add
  );

  await accountService.updateAccountBalances(
    tx,
    [newTransaction],
    OperationMode.Add
  );

  await categoryService.rta.calculateMonthsAvailable(tx, userId, rtaCategoryId);
};
