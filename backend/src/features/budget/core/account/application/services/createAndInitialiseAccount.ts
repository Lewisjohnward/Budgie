import { type Prisma } from "@prisma/client";
import { transactionService } from "../../../transaction/transaction.service";
import { accountService } from "../../account.service";
import { type CreateAccountCommand } from "../use-cases/createAccount";
import { type DomainAccount } from "../../account.types";
import { type DomainNormalTransaction } from "../../../transaction/transaction.types";
import { type DomainMonth } from "../../../category/core/category.types";

type CreateAndInitialiseAccountResult = {
  createdAccount: DomainAccount;
  createdTransaction?: DomainNormalTransaction;
  updatedMonths: DomainMonth[];
};

/**
 * Creates and initialises a user account, optionally recording an opening balance.
 *
 * Creates the account and, if a non-zero opening balance is provided, creates
 * an associated system transaction. The account's deletable status is refreshed
 * when an opening balance transaction is created.
 *
 * All operations are performed within the provided Prisma transaction to ensure
 * atomicity.
 *
 * Behaviour:
 * - Creates the account using the supplied command.
 * - Creates an opening balance transaction if the balance is non-zero.
 * - Refreshes the account's deletable status when an opening balance transaction
 *   is created.
 * - Collects any budget months updated by the opening balance transaction.
 *
 * @param tx - The Prisma transaction client used for all database operations.
 * @param payload - The command containing the account creation details.
 * @param payload.userId - ID of the user who owns the account.
 * @param payload.balance - The initial account balance.
 *
 * @returns The created account, optionally including its opening balance
 *   transaction, and any budget months updated during initialisation.
 */
export const createAndInitialiseAccount = async (
  tx: Prisma.TransactionClient,
  payload: CreateAccountCommand
): Promise<CreateAndInitialiseAccountResult> => {
  const { userId, balance } = payload;
  const hasOpeningBalance = !balance.isZero();

  let createdAccount = await accountService.createAccount(tx, payload);

  let createdTransaction: DomainNormalTransaction | undefined;
  let updatedMonths: DomainMonth[] = [];

  if (hasOpeningBalance) {
    const result = await transactionService.createOpeningBalanceTransaction(
      tx,
      userId,
      createdAccount.id,
      balance
    );

    createdTransaction = result.createdTransaction;
    updatedMonths = result.updatedMonths;

    await accountService.refreshDeletableStatus(tx, [createdAccount.id]);

    [createdAccount] = await accountService.getAccountsByIds(tx, userId, [
      createdAccount.id,
    ]);
  }

  return { createdAccount, createdTransaction, updatedMonths };
};
