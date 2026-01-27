import { Prisma } from "@prisma/client";
import { ZERO } from "../../../../../shared/constants/zero";
import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { SameAccountTransferError } from "../../transaction.errors";
import { TransferTransactionInsertData } from "../../transaction.types";
import {
  createTransferDestinationTransaction,
  createTransferSourceTransaction,
} from "./create/createTransferTransaction";
import { categoryService } from "../../../category/category.service";
import { memoService } from "../../../memo/memo.service";

export async function insertTransferTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  transaction: TransferTransactionInsertData
): Promise<void> {
  const {
    accountId,
    transferAccountId,
    date,
    inflow,
    outflow,
    // payeeName should be absent anyway, but keep to avoid spreading it
    payeeName: _payeeName,
    ...txInput
  } = transaction;

  // Validate transfer destination account exists and user owns it
  const destinationAccount = await accountService.getAccount(
    tx,
    transferAccountId,
    userId
  );

  // Prevent same-account transfer
  if (destinationAccount.id === accountId) {
    throw new SameAccountTransferError();
  }

  const inflowAmount = inflow ?? ZERO;
  const outflowAmount = outflow ?? ZERO;

  // Create source transaction (money leaving or entering source account)
  const sourceTransaction = await createTransferSourceTransaction(tx, {
    ...txInput,
    accountId,
    date,
    transferAccountId: destinationAccount.id,
    inflow: inflowAmount,
    outflow: outflowAmount,
  });

  // Create destination transaction (inverse of source)
  const destinationTransaction = await createTransferDestinationTransaction(
    tx,
    {
      ...txInput,
      accountId: destinationAccount.id,
      date,
      transferAccountId: accountId,
      transferTransactionId: sourceTransaction.id,
      inflow: outflowAmount,
      outflow: inflowAmount,
    }
  );

  await transactionRepository.updateTransaction(tx, sourceTransaction.id, {
    transferTransactionId: destinationTransaction.id,
  });

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
  await memoService.insertMissingMemos(tx, userId, sourceTransaction.date);
}
