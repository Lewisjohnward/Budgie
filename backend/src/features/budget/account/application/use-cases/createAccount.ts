import { transactionService } from "../../../transaction/transaction.service";
import { type AddAccountPayload } from "../../account.schema";
import { prisma } from "../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { accountService } from "../../account.service";
import { DuplicateAccountNameError } from "../../account.errors";

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
 * Creates a new user account with optional opening balance.
 *
 * This function ensures atomicity by performing all operations in a single database transaction:
 * 1. Inserts the account into the database.
 * 2. Creates an associated AccountPayee for transfers.
 * 3. If a non-zero balance is provided, creates an opening balance transaction and updates account deletable status.
 *
 * The function will retry up to 5 times if a position conflict occurs, and throws a `DuplicateAccountNameError`
 * if the account name already exists.
 *
 * @param payload - The data required to create the account
 * @param payload.userId - ID of the user who owns the account
 * @param payload.name - Display name of the account
 * @param payload.type - Type of account ("BANK" | "CREDIT_CARD")
 * @param payload.position - Position/order of the account for UI purposes
 * @param payload.balance - Optional opening balance (must be non 0)
 *
 * @returns A promise that resolves once the account (and optional opening balance transaction) is successfully created.
 *
 * @throws {DuplicateAccountNameError} If an account with the same name already exists.
 * @throws {Error} If the transaction fails after retries.
 */
export const createAccount = async (
  payload: AddAccountPayload
): Promise<void> => {
  const { userId, balance } = toCreateAccountCommand(payload);

  for (let i = 0; i < 5; i++) {
    try {
      await prisma.$transaction(async (tx) => {
        const hasOpeningBalance = !balance.isZero();

        const createdAccount = await accountService.createAccount(tx, payload);

        if (hasOpeningBalance) {
          await transactionService.createOpeningBalanceTransaction(
            tx,
            userId,
            createdAccount.id,
            balance
          );

          await accountService.refreshDeletableStatus(tx, [createdAccount.id]);
        }
      });

      return;
    } catch (err: any) {
      if (err.code === "P2002") {
        const fields = (err.meta?.target ?? []) as string[];

        if (fields.includes("position")) {
          continue;
        }

        if (fields.includes("name")) {
          throw new DuplicateAccountNameError();
        }
      }

      throw err;
    }
  }

  throw new Error("Failed to create account after retries");
};
