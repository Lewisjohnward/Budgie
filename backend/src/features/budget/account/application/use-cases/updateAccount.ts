import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { type EditAccountPayload } from "../../account.schema";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";
import { type AccountId, asAccountId } from "../../account.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

export type EditAccountCommand = Omit<EditAccountPayload, "id" | "userId"> & {
  accountId: AccountId;
  userId: UserId;
};

export const toEditAccountCommand = (
  p: EditAccountPayload
): EditAccountCommand => ({
  ...p,
  userId: asUserId(p.userId),
  accountId: asAccountId(p.accountId),
});

export const editAccount = async (
  payload: EditAccountPayload
): Promise<void> => {
  const { accountId, userId, name, balanceAdjustment } =
    toEditAccountCommand(payload);

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
          balanceChange
        );
      }
    }
  });
};
