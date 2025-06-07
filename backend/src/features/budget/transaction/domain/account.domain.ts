/**
 * Updates account balances based on a list of transactions and the operation mode.
 *
 * - Calculates the net balance changes per account using `calculateBalanceChangePerAccount`.
 * - Applies these balance changes by calling `budgetRepository.updateAccountBalances` with the provided Prisma transaction client.
 *
 * @param prisma - The Prisma transaction client to ensure atomic database updates.
 * @param transactions - The list of transactions that affect account balances.
 * @param mode - The operation mode indicating whether transactions are being added or deleted.
 */

import { Prisma, Transaction } from "@prisma/client";
import { calculateBalanceChangePerAccount } from "../utils/calculateBalanceChangePerAccount";
import { budgetRepository } from "../../../../shared/repository/budgetRepositoryImpl";
import { OperationMode } from "../../../../shared/enums/operation-mode";

export const updateAccountBalances = async (
  prisma: Prisma.TransactionClient,
  transactions: Transaction[],
  mode: OperationMode,
) => {
  const accountBalanceChanges = calculateBalanceChangePerAccount(
    transactions,
    mode,
  );

  await budgetRepository.updateAccountBalances(prisma, accountBalanceChanges);
};
