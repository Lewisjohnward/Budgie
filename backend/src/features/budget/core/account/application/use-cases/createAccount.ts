import { type AddAccountPayload } from "../../account.schema";
import { prisma } from "../../../../../../shared/prisma/client";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { accountService } from "../../account.service";
import { DuplicateAccountNameError } from "../../account.errors";
import { type CreateAccountResult } from "../../account.contract";

export type CreateAccountCommand = Omit<AddAccountPayload, "userId"> & {
  userId: UserId;
};

const toCreateAccountCommand = (
  p: AddAccountPayload
): CreateAccountCommand => ({
  ...p,
  userId: asUserId(p.userId),
});

/**
 * Creates a new account for a user, optionally initialising it with an opening balance.
 *
 * Account creation and initialisation are performed atomically within a Prisma
 * transaction. If an opening balance is provided and non-zero, an associated
 * system transaction is created.
 *
 * The operation handles concurrent account creation by retrying when a position
 * uniqueness conflict occurs. Account name conflicts are converted into a
 * DuplicateAccountNameError.
 *
 * Behaviour:
 * - Converts the incoming payload into a typed CreateAccountCommand.
 * - Creates the account and its associated resources.
 * - Creates an opening balance transaction when the provided balance is non-zero.
 * - Retries the operation up to five times if a position uniqueness conflict occurs.
 *
 * @param payload - The data required to create the account.
 * @param payload.userId - ID of the user who will own the account.
 * @param payload.name - Display name of the account.
 * @param payload.type - Type of account (BANK or CREDIT_CARD).
 * @param payload.position - Position/order of the account within the user's accounts.
 * @param payload.balance - Initial account balance.
 *
 * @returns The created account, optionally including its opening balance transaction
 *   and any updated budget months.
 *
 * @throws {DuplicateAccountNameError} If an account with the same name already exists.
 * @throws {Error} If account creation fails or all position conflict retries are exhausted.
 */
export const createAccount = async (
  payload: AddAccountPayload
): Promise<CreateAccountResult> => {
  for (let i = 0; i < 5; i++) {
    try {
      return await prisma.$transaction(async (tx) =>
        accountService.createAndInitialiseAccount(
          tx,
          toCreateAccountCommand(payload)
        )
      );
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
