import { Decimal } from "@prisma/client/runtime/library";
import { UserId } from "../../../../user/auth/auth.types";
import { AccountId } from "../../../account/account.types";
import { Prisma } from "@prisma/client";
import { categoryService } from "../../../category/core/category.service";
import { createNormalTransaction } from "./create/createNormalTransaction";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { ZERO } from "../../../../../shared/constants/zero";
import { PayeeId } from "../../../payee/payee.types";

type SystemTransactionOptions = {
  userId: UserId;
  accountId: AccountId;
  amount: Decimal;
  memo?: string;
  payeeId: PayeeId;
};

/**
 * Creates a **system-generated transaction** for a user's account.
 *
 * This function inserts a transaction with `origin: "SYSTEM"` and a specified
 * `payeeId`, ensuring it is correctly categorized under the RTA category
 * and all related side-effects are applied.
 *
 * Behavior:
 * - Determines the correct RTA category for the user.
 * - Sets `inflow` if the amount is positive, `outflow` if negative.
 * - Inserts the transaction in the database using `createNormalTransaction`.
 * - Updates RTA month activity and recalculates months available.
 * - Updates the account balance to reflect the new transaction.
 *
 * Domain invariants:
 * - All system transactions must belong to the RTA category.
 * - Transactions must reference a valid account owned by the user.
 * - All side-effects are applied within the provided Prisma transaction to ensure atomicity.
 *
 * @param {Prisma.TransactionClient} tx - Prisma transaction client used for all database operations.
 * @param {SystemTransactionOptions} options - Options for the system transaction:
 *   @param {UserId} options.userId - ID of the user owning the account.
 *   @param {AccountId} options.accountId - ID of the account for the transaction.
 *   @param {Decimal} options.amount - Transaction amount (positive for inflow, negative for outflow).
 *   @param {string} [options.memo] - Optional memo/description for the transaction.
 *   @param {PayeeId} options.payeeId - ID of the system payee associated with the transaction.
 *
 * @returns {Promise<void>} Resolves when the transaction is inserted and all related updates are complete.
 *
 * @example
 * await createSystemTransaction(tx, {
 *   userId: "user-123",
 *   accountId: "acc-456",
 *   amount: new Decimal(100),
 *   memo: "Starting Balance",
 *   payeeId: "payee-789"
 * });
 */
export const createSystemTransaction = async (
  tx: Prisma.TransactionClient,
  { userId, accountId, amount, memo, payeeId }: SystemTransactionOptions
): Promise<void> => {
  const date = new Date();

  const categoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const transaction = await createNormalTransaction(tx, {
    accountId,
    date,
    inflow: amount.gt(0) ? amount.abs() : ZERO,
    outflow: amount.lt(0) ? amount.abs() : ZERO,
    categoryId,
    memo,
    origin: "SYSTEM",
    payeeId,
  });

  await categoryService.rta.updateMonthsActivityForTransactions(
    tx,
    userId,
    categoryId,
    [transaction],
    OperationMode.Add
  );

  await categoryService.rta.calculateMonthsAvailable(tx, userId, categoryId);

  await accountService.updateAccountBalances(
    tx,
    [transaction],
    OperationMode.Add
  );
};
