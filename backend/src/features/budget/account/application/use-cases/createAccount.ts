import { ZERO } from "../../../../../shared/constants/zero";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { transactionService } from "../../../transaction/transaction.service";
import { type AddAccountPayload } from "../../account.schema";
import { prisma } from "../../../../../shared/prisma/client";
import { accountMapper } from "../../account.mapper";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";

type CreateAccountCommand = Omit<AddAccountPayload, "userId"> & {
  userId: UserId;
};

const toCreateAccountCommand = (
  p: AddAccountPayload
): CreateAccountCommand => ({
  ...p,
  userId: asUserId(p.userId),
});

/**
 * Creates a new user account, optionally initializing it with an opening balance.
 *
 * This function performs all operations inside a single database transaction to ensure atomicity:
 * 1. Creates the account in the database with an initial balance of zero.
 * 2. Creates an associated AccountPayee to allow transfers to/from this account.
 * 3. If an opening balance greater than zero is provided, creates a corresponding opening balance transaction.
 *
 * @param payload - Data required to create the account
 * @param payload.userId - ID of the user who owns the account
 * @param payload.name - Display name of the account
 * @param payload.type - Type of account ("BANK" | "CREDIT_CARD")
 * @param payload.position - Position/order of the account for UI purposes
 * @param payload.balance - Optional opening balance for the account (must be >= 0)
 *
 * @returns A promise that resolves when the account (and optional opening balance transaction) is successfully created.
 *
 * @throws {Error} Throws if any step of the transaction fails (account creation or opening balance transaction).
 */

// TODO:(lewis 2026-02-15 16:10) the payload will need UserId?
export const createAccount = async (
  payload: AddAccountPayload
): Promise<void> => {
  const { userId, balance: inflow } = toCreateAccountCommand(payload);
  await prisma.$transaction(async (tx) => {
    const row = await accountRepository.createAccount(tx, {
      ...payload,
      balance: ZERO,
    });

    const hasOpeningBalance = payload.balance.gt(0);
    const createdAccount = accountMapper.toDomainAccount(row);

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
