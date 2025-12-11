import { prisma } from "../../../../../shared/prisma/client";
import { accountService } from "../../../account/account.service";
import { TransactionData } from "../../transaction.schema";
import { transactionService } from "../../transaction.service";
import { assertTransactionDateWithinLast12Months } from "../../utils/assertTransactionDateWithinLast12Months";

/**
 * Orchestrates insertion of a new transaction for a user.
 *
 * Responsibilities:
 * - Executes the operation inside a database transaction
 * - Validates that the source account is owned by the user
 * - Determines whether the transaction is a transfer or a normal transaction
 * - Delegates all creation and side-effects to the appropriate transaction service
 *
 * Notes:
 * - Schema-level validation (dates, inflow/outflow rules, mutually exclusive fields)
 *   is assumed to have already occurred before this function is called.
 * - Transfer transactions are fully handled by `insertTransferTransaction`.
 * - Normal transactions (including category resolution, month updates, and balance
 *   recalculation) are fully handled by `insertNormalTransaction`.
 *
 * @param userId - ID of the user creating the transaction
 * @param transaction - Validated transaction input data
 *
 * @throws {Error} If the user does not own the source account
 * @throws {SameAccountTransferError} If a transfer targets the same account
 */

export const insertTransaction = async (
  userId: string,
  transaction: TransactionData
) => {
  const { accountId, transferAccountId } = transaction;

  const date = transaction.date ?? new Date();

  if (date !== undefined) {
    assertTransactionDateWithinLast12Months(date);
  }

  await prisma.$transaction(async (tx) => {
    // check the account is owned by user
    await accountService.getAccount(tx, accountId, userId);

    if (transferAccountId) {
      await transactionService.insertTransferTransaction(tx, userId, {
        ...transaction,
        date,
        transferAccountId,
      });
      return;
    }

    await transactionService.insertNormalTransaction(tx, userId, {
      ...transaction,
      date,
    });
  });
};
