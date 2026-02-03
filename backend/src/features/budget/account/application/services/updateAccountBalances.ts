import { Prisma } from "@prisma/client";
import { calculateBalanceChangePerAccount } from "../../domain/account.domain";
import { accountRepository } from "../../../../../shared/repository/accountRepositoryImpl";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { type Decimal } from "@prisma/client/runtime/library";
import { type AccountId } from "../../account.types";

/**
 * Represents a transaction that affects an account balance.
 * Used by services that calculate net balance changes.
 */
export type BalanceAffectingTransaction = {
  accountId: AccountId;
  inflow: Decimal;
  outflow: Decimal;
};

/**
 * A mapping of account IDs to their net balance change.
 * Used internally by the balance update service.
 */
export type BalanceChangeMap = Record<AccountId, Decimal>;

/**
 * Updates account balances based on a list of transactions and an operation mode.
 *
 * Steps:
 * 1. Calculates the net balance change per account using `calculateBalanceChangePerAccount`.
 * 2. Calls the repository to apply these changes atomically using the provided Prisma transaction client.
 *
 * @param tx - Prisma transaction client for atomic updates.
 * @param transactions - List of transactions that impact account balances.
 * @param mode - Indicates whether transactions are being added or removed.
 */
export const updateAccountBalances = async (
  tx: Prisma.TransactionClient,
  transactions: BalanceAffectingTransaction[],
  mode: OperationMode
): Promise<void> => {
  const accountBalanceChanges: BalanceChangeMap =
    calculateBalanceChangePerAccount(transactions, mode);

  await accountRepository.updateAccountBalances(tx, accountBalanceChanges);
};
