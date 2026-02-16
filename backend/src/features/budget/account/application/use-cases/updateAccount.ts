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

/**
 * Updates an existing account's properties within a single transaction.
 *
 * Supports updating the account name and/or adjusting the balance.
 * Balance updates are handled by creating a corresponding adjustment transaction
 * rather than directly mutating the stored balance.
 *
 * Only fields that differ from the current account state are applied.
 *
 * @param payload - The data required to edit the account
 *
 * @returns A promise that resolves once the account has been successfully updated
 *
 * @throws {Error} If the account cannot be found or the transaction fails
 */
export const editAccount = async (
  payload: EditAccountPayload
): Promise<void> => {
  const {
    accountId,
    userId,
    updates: { name, balance },
  } = toEditAccountCommand(payload);

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(tx, accountId, userId);

    // Name
    if (name && name !== account.name) {
      await accountService.updateAccountName(tx, account.id, name);
    }

    // Balance adjustment - insert a balance adjustment tx
    if (balance !== undefined) {
      await accountService.adjustAccountBalance({
        tx,
        userId,
        accountId: account.id,
        currentBalance: account.balance,
        targetBalance: balance,
      });
    }
  });
};
