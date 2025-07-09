import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { EditAccountSchema } from "../../account.schema";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";

export const updateAccount = async (payload: EditAccountSchema) => {
  const { accountId, userId, name, balanceAdjustment } = payload;

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);

    if (name) {
      await accountRepository.updateAccount(tx, account.id, name);
    }

    if (balanceAdjustment !== undefined) {
      const balanceChange = balanceAdjustment.sub(account.balance);

      if (!balanceChange.isZero()) {
        await transactionService.createBalanceAdjustmentTransaction(
          tx,
          userId,
          account.id,
          balanceChange,
        );
      }
    }
  });
};
