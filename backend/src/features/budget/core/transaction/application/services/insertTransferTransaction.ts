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

/**
 * Creates a **transfer transaction** between two accounts for a given user.
 *
 * This function creates both sides of a transfer:
 * - **Source transaction** – represents money leaving the `accountId`.
 * - **Destination transaction** – represents money arriving in the `transferAccountId`.
 *
 * Behaviour:
 * - Validates that the destination account exists and is owned by the user.
 * - Prevents transfers where the source and destination accounts are the same.
 * - Defaults `inflow` and `outflow` amounts to zero if undefined.
 * - Persists both transactions atomically and links them via `transferTransactionId`.
 * - Updates account balances for both accounts.
 * - Inserts missing months and memos associated with the transaction date.
 *
 * Domain invariants:
 * - Transfers must occur between two distinct accounts.
 * - `categoryId` is `null` for both source and destination transactions.
 * - The source transaction ID is referenced in the destination transaction.
 *
 * @param tx - Prisma transaction client used for all database operations.
 * @param userId - The ID of the user performing the transfer.
 * @param transaction - Details of the transfer transaction, including source and destination accounts, amounts, and date.
 *
 * @throws {SameAccountTransferError} If the source and destination accounts are the same.
 * @throws Will throw if the destination account does not exist or is not owned by the user.
 *
 * @returns A promise that resolves once both transactions are successfully created and balances updated.
 */
export async function createTransferTransaction(
  tx: Prisma.TransactionClient,
  command: CreateTransactionCommand & {
    transferAccountId: AccountId;
  }
): Promise<{
  transactions: DomainTransferTransaction[];
  accounts: DomainAccount[];
  memos: DomainMemo[];
}> {
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
    accountId,
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

  // Create source transaction (money leaving or entering source account)
  // const sourceTransaction = await createTransferSourceTransaction(tx, {
  //   ...txInput,
  //   accountId,
  //   date,
  //   transferAccountId: destinationAccount.id,
  //   inflow: inflowAmount,
  //   outflow: outflowAmount,
  // });

  const rows = await tx.transaction.createManyAndReturn({
    data: [sourceTx, destinationTx],
  });
  // await tx.transaction.createMany({
  //   data: [sourceTx, destinationTx],
  // });
  //
  // const rows = await tx.transaction.findMany({
  //   where: {
  //     id: {
  //       in: [sourceId, destinationId],
  //     },
  //   },
  // });
  //
  const [sourceTransaction, destinationTransaction] = rows.map(
    transactionMapper.toDomainTransferTransaction
  );

  // Create destination transaction (inverse of source)
  // const destinationTransaction = await createTransferDestinationTransaction(
  //   tx,
  //   {
  //     ...txInput,
  //     accountId: destinationAccount.id,
  //     date,
  //     transferAccountId: accountId,
  //     transferTransactionId: sourceTransaction.id,
  //     inflow: outflowAmount,
  //     outflow: inflowAmount,
  //   }
  // );
  //
  // await transactionRepository.updateTransaction(tx, sourceTransaction.id, {
  //   transferTransactionId: destinationTransaction.id,
  // });

  // Update balances for both accounts
  await accountService.updateAccountBalances(
    tx,
    [sourceTransaction, destinationTransaction],
    OperationMode.Add
  );

  // insert the missing months
  await categoryService.months.insertMissingMonths(
    tx,
    userId,
    sourceTransaction.date
  );

  // insert the missing memos
  const memos = await memoService.insertMissingMemos(
    tx,
    userId,
    sourceTransaction.date
  );

  await accountService.refreshDeletableStatus(tx, [
    accountId,
    destinationAccount.id,
  ]);

  await accountService.refreshDeletableStatus(tx, [
    accountId,
    destinationAccount.id,
  ]);

  const destRow = await accountRepository.getAccount(tx, accountId, userId);
  if (!destRow) throw new Error("where is the account?");
  const destAccount = accountMapper.toDomainAccount(destRow);

  const sourceRowUpdated = await accountRepository.getAccount(
    tx,
    accountId,
    userId
  );
  if (!sourceRowUpdated) throw new Error("where is the account?");
  const sourceAccountUpdated = accountMapper.toDomainAccount(destRow);

  return {
    transactions: [sourceTransaction, destinationTransaction],
    accounts: [destAccount, sourceAccountUpdated],
    memos,
  };
}
