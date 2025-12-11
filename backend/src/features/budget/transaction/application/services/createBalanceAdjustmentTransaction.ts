import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { categoryRepository } from "../../../../../shared/repository/categoryRepositoryImpl";
import { ZERO } from "../../../../../shared/constants/zero";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { categoryService } from "../../../category/category.service";
import { createNormalTransaction } from "./create/createNormalTransaction";

export const createBalanceAdjustmentTransaction = async (
  tx: Prisma.TransactionClient,
  userId: string,
  accountId: string,
  balanceChange: Decimal
) => {
  const rtaCategoryId = await categoryRepository.getRtaCategoryId(tx, userId);
  const date = new Date();

  const newTransaction = await createNormalTransaction(tx, {
    accountId,
    date,
    inflow: balanceChange.gt(0) ? ZERO : balanceChange,
    outflow: balanceChange.lt(0) ? ZERO : balanceChange,
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
