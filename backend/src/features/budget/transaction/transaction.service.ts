import { updatePayeeForTransactions } from "./application/services/updatePayeeForTransactions";
import { getTransactionsWithPairs } from "./application/services/getTransactionsWithPairs";
import { getTransactionsByCategoryId } from "./application/services/getTransactionsByCategoryId";
import { applyCategoryChange } from "./application/services/bulk/applyCategoryChange";
import { applyMemoChange } from "./application/services/bulk/applyMemoChange";
import { applyAccountChange } from "./application/services/bulk/applyAccountChange/applyAccountChange";
import { insertTransferTransaction } from "./application/services/insertTransferTransaction";
import { insertNormalTransaction } from "./application/services/insertNormalTransaction";
import { getTransactionById } from "./application/services/getTransactionById";
import { Prisma } from "@prisma/client";
import { UserId } from "../../user/auth/auth.types";
import { AccountId } from "../account/account.types";
import { Decimal } from "@prisma/client/runtime/library";
import { createSystemTransaction } from "./application/services/createSystemTransaction";
import { ZERO } from "../../../shared/constants/zero";
import { deleteTransactionsById } from "./application/services/deleteTransactionsById";
import { deleteTransactionsByAccountId } from "./application/services/deleteTransactionsByAccountId";
import { payeeService } from "../payee/payee.service";

export const transactionService = {
  // insert
  insertTransferTransaction,
  insertNormalTransaction,

  // create
  createBalanceAdjustmentTransaction: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    accountId: AccountId,
    balance: Decimal
  ) => {
    const balanceAdjustmentPayeeId =
      await payeeService.getBalanceAdjustmentPayeeId(tx, userId);

    await createSystemTransaction(tx, {
      userId,
      accountId,
      amount: balance,
      payeeId: balanceAdjustmentPayeeId,
    });
  },

  createOpeningBalanceTransaction: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    accountId: AccountId,
    balance: Decimal
  ) => {
    const startingBalancePayeeId = await payeeService.getStartingBalancePayeeId(
      tx,
      userId
    );

    await createSystemTransaction(tx, {
      userId,
      accountId,
      amount: balance,
      memo: "Starting Balance",
      payeeId: startingBalancePayeeId,
    });
  },

  createClosingBalanceTransaction: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    accountId: AccountId,
    balance: Decimal
  ) => {
    const balanceAdjustmentPayeeId =
      await payeeService.getBalanceAdjustmentPayeeId(tx, userId);

    await createSystemTransaction(tx, {
      userId,
      accountId,
      amount: ZERO.sub(balance),
      memo: "Closed Account",
      payeeId: balanceAdjustmentPayeeId,
    });
  },

  // update
  updatePayeeForTransactions,

  // read
  getTransactionById,
  getTransactionsWithPairs,
  getTransactionsByCategoryId,

  // delete
  deleteTransactionsById,
  deleteTransactionsByAccountId,

  // bulk
  bulk: {
    applyCategoryChange,
    applyAccountChange,
    applyMemoChange,
  },
};
