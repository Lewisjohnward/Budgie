import { Decimal } from "@prisma/client/runtime/library";
import { transactionService } from "../../../transaction/transaction.service";
import { Prisma } from "@prisma/client";
import { AccountId } from "../../account.types";
import { UserId } from "../../../../user/auth/auth.types";

/**
 * Adjusts the balance of an account by creating a corresponding balance adjustment transaction.
 *
 * This is used when a user manually changes the balance of an account. The function calculates
 * the difference between the current balance and the target balance and creates a transaction
 * to reconcile the difference.
 *
 * @param params - Object containing all parameters
 * @param params.tx - Prisma transaction client
 * @param params.userId - ID of the user who owns the account
 * @param params.accountId - ID of the account to adjust
 * @param params.currentBalance - Current balance of the account
 * @param params.targetBalance - Desired target balance for the account
 *
 * @returns A promise that resolves once the balance adjustment transaction has been created
 */
type AdjustAccountBalanceParams = {
  tx: Prisma.TransactionClient;
  userId: UserId;
  accountId: AccountId;
  currentBalance: Decimal;
  targetBalance: Decimal;
};

export const adjustAccountBalance = async ({
  tx,
  userId,
  accountId,
  currentBalance,
  targetBalance,
}: AdjustAccountBalanceParams) => {
  const balanceChange = targetBalance.sub(currentBalance);

  if (!balanceChange.isZero()) {
    await transactionService.createBalanceAdjustmentTransaction(
      tx,
      userId,
      accountId,
      balanceChange
    );
  }
};
