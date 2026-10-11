import { Prisma } from "@prisma/client";
import { ZERO } from "../../../../../../shared/constants/zero";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { v4 as uuidv4 } from "uuid";
import { accountService } from "../../../account/account.service";
import { SameAccountTransferError } from "../../transaction.errors";
import { categoryService } from "../../../category/core/category.service";
import { memoService } from "../../../memo/memo.service";
import {
  type DomainAccount,
  type AccountId,
} from "../../../account/account.types";
import { type CreateTransactionCommand } from "../use-cases/insertTransaction";
import {
  asTransactionId,
  DomainTransferTransaction,
} from "../../transaction.types";
import { transactionMapper } from "../../transaction.mapper";
import { type DomainMemo } from "../../../memo/memo.types";
import { accountMapper } from "../../../account/account.mapper";
import { accountRepository } from "../../../../../../shared/repository/accountRepositoryImpl";
import { DomainMonth } from "../../../category/core/category.types";

type CreateTransferTransactionResult = {
  sourceTransaction: DomainTransferTransaction;
  destinationTransaction: DomainTransferTransaction;
  updatedAccounts: DomainAccount[];
  createdMonths: DomainMonth[];
  createdMemos: DomainMemo[];
};

/**
 * Creates a transfer between two accounts and applies its associated domain
 * changes within the provided Prisma transaction.
 *
 * Validates access to both accounts and prevents transfers between the same
 * account. Creates linked source and destination transactions, updates both
 * account balances, creates any missing budget months and memos, and refreshes
 * account deletable status.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param command - Transfer command containing the source and destination
 * account IDs, user ID, date, and transaction amounts.
 *
 * @returns The created source and destination transactions, updated source
 * and destination accounts, newly created budget months, and newly created
 * memos.
 *
 * @throws {SameAccountTransferError} If the source and destination accounts
 * are the same.
 * @throws If either account is inaccessible to the user or a database
 * operation fails.
 */
export async function createTransferTransaction(
  tx: Prisma.TransactionClient,
  command: CreateTransactionCommand & {
    transferAccountId: AccountId;
  }
): Promise<CreateTransferTransactionResult> {
  const {
    userId,
    accountId,
    transferAccountId,
    date,
    inflow,
    outflow,
    // payeeName should be absent anyway, but keep to avoid spreading it
    payeeName: _payeeName,
    // remove type
    type: _type,
    ...txInput
  } = command;

  // Validate transfer destination account exists and user owns it
  const destinationAccount = await accountService.getAccount(
    tx,
    transferAccountId,
    userId
  );

  // TODO:(lewis 2026-05-31 14:52) needs testing that cant proivide a non owned source and dest account
  const sourceAccount = await accountService.getAccount(tx, accountId, userId);

  // Prevent same-account transfer
  if (destinationAccount.id === accountId) {
    throw new SameAccountTransferError();
  }

  const inflowAmount = inflow ?? ZERO;
  const outflowAmount = outflow ?? ZERO;

  const sourceId = asTransactionId(uuidv4());
  const destinationId = asTransactionId(uuidv4());

  const sourceTx = {
    ...txInput,
    id: sourceId,
    accountId: sourceAccount.id,
    date,
    transferAccountId: destinationAccount.id,
    transferTransactionId: destinationId,
    inflow: inflowAmount,
    outflow: outflowAmount,
    categoryId: null,
  };

  const destinationTx = {
    ...txInput,
    id: destinationId,
    accountId: destinationAccount.id,
    date,
    transferAccountId: accountId,
    transferTransactionId: sourceId,
    inflow: outflowAmount,
    outflow: inflowAmount,
    categoryId: null,
  };

  const rows = await tx.transaction.createManyAndReturn({
    data: [sourceTx, destinationTx],
  });

  const sourceRow = rows.find((row) => row.id === sourceId);
  const destinationRow = rows.find((row) => row.id === destinationId);

  if (!sourceRow || !destinationRow) {
    throw new Error("Failed to create both transfer transactions.");
  }

  const sourceTransaction =
    transactionMapper.toDomainTransferTransaction(sourceRow);

  const destinationTransaction =
    transactionMapper.toDomainTransferTransaction(destinationRow);

  // Update balances for both accounts
  await accountService.updateAccountBalances(
    tx,
    [sourceTransaction, destinationTransaction],
    OperationMode.Add
  );

  // insert the missing months
  const createdMonths = await categoryService.months.insertMissingMonths(
    tx,
    userId,
    sourceTransaction.date
  );

  // insert the missing memos
  const createdMemos = await memoService.insertMissingMemos(
    tx,
    userId,
    sourceTransaction.date
  );

  await accountService.refreshDeletableStatus(tx, [
    sourceAccount.id,
    destinationAccount.id,
  ]);

  const destinationAccountRaw = await accountRepository.getAccount(
    tx,
    destinationAccount.id,
    userId
  );
  if (!destinationAccountRaw) throw new Error("where is the account?");
  const destAccount = accountMapper.toDomainAccount(destinationAccountRaw);

  const sourceAccountRaw = await accountRepository.getAccount(
    tx,
    sourceAccount.id,
    userId
  );
  if (!sourceAccountRaw) throw new Error("where is the account?");
  const sourceAccountUpdated = accountMapper.toDomainAccount(sourceAccountRaw);

  return {
    sourceTransaction: sourceTransaction,
    destinationTransaction: destinationTransaction,
    updatedAccounts: [sourceAccountUpdated, destAccount],
    createdMonths,
    createdMemos: createdMemos,
  };
}
