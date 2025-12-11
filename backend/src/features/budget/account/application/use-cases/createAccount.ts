import { ZERO } from "../../../../../shared/constants/zero";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { AddAccountPayload } from "../../account.schema";
import { prisma } from "../../../../../shared/prisma/client";

// TODO:(lewis 2026-01-07 02:30) jsdoc needs updating

/**
 * Creates a new account with an optional opening balance.
 *
 * This function performs the following operations within a database transaction:
 * 1. Creates the account with an initial balance of zero
 * 2. Creates an associated AccountPayee to enable transfers to/from this account
 * 3. If an opening balance is provided (> 0), creates an opening balance transaction
 *
 * @param payload - The account creation data
 * @param payload.userId - The ID of the user creating the account
 * @param payload.balance - The opening balance for the account (must be >= 0)
 * @returns A promise that resolves when the account is successfully created
 * @throws Will throw an error if the transaction fails at any step
 */

export const createAccount = async (
  payload: AddAccountPayload
): Promise<void> => {
  const { userId, balance: inflow } = payload;
  await prisma.$transaction(async (tx) => {
    const createdAccount = await accountRepository.createAccount(tx, {
      ...payload,
      balance: ZERO,
    });

    const hasOpeningBalance = payload.balance.gt(0);

    if (hasOpeningBalance) {
      await transactionService.createOpeningBalanceTransaction(
        tx,
        userId,
        createdAccount.id,
        inflow
      );
    }
  });
};
