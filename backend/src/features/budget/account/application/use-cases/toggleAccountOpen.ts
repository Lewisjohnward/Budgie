import { transactionService } from "../../../transaction/transaction.service";
import { ToggleAccountPayload } from "../../account.schema";
import { accountService } from "../../../account/account.service";
import { prisma } from "../../../../../shared/prisma/client";
import { type AccountId, asAccountId } from "../../account.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { CannotCloseDeletableAccountError } from "../../account.errors";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";

export type ToggleAccountOpenCommand = Omit<
  ToggleAccountPayload,
  "accountId" | "userId"
> & {
  accountId: AccountId;
  userId: UserId;
};

export const toToggleAccountOpenCommand = (
  p: ToggleAccountPayload
): ToggleAccountOpenCommand => ({
  ...p,
  userId: asUserId(p.userId),
  accountId: asAccountId(p.accountId),
});

/**
 * Toggles the open/closed state of an account.
 *
 * If the account is currently open, this will "close" it:
 *   - Marks the account as closed (`open = false`).
 *   - If the account has a positive balance, creates a zeroing transaction
 *     to adjust the balance to zero.
 *
 * If the account is currently closed, this will "unclose" it:
 *   - Marks the account as open (`open = true`).
 *   - No balance changes are performed when reopening.
 *
 * The operation is performed within a database transaction to ensure
 * consistency, including balance adjustments and the open state update.
 *
 * Throws {@link CannotCloseDeletableAccountError} if the account is deletable,
 * because deletable accounts cannot be closed.
 *
 * @param {ToggleAccountPayload} payload - The account and user information required
 *   to perform the toggle.
 * @returns {Promise<void>} Resolves when the operation completes successfully.
 */
export const toggleAccountOpen = async (
  payload: ToggleAccountPayload
): Promise<void> => {
  const { userId, accountId } = toToggleAccountOpenCommand(payload);

  await prisma.$transaction(async (tx) => {
    const account = await accountService.getAccount(
      tx,
      asAccountId(accountId),
      asUserId(userId)
    );
    const { deletable, open } = account;

    if (deletable) {
      throw new CannotCloseDeletableAccountError();
    }

    if (!open) {
      await accountRepository.setAccountOpen(tx, account.id, true);
      return;
    }

    if (account.balance.gt(0)) {
      await transactionService.createClosingBalanceTransaction(
        tx,
        userId,
        account.id,
        account.balance
      );
    }

    await accountRepository.setAccountOpen(tx, account.id, false);
  });
};
