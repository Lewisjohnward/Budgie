import { createBalanceAdjustmentTransaction } from "./application/services/createBalanceAdjustmentTransaction";
import { createOpeningBalanceTransaction } from "./application/services/createOpeningBalanceTransaction";
import { updatePayeeForTransactions } from "./application/services/updatePayeeForTransactions";
import { getTransactionsWithPairs } from "./application/services/getTransactionsWithPairs";
import { getTransactionsByCategoryId } from "./application/services/getTransactionsByCategoryId";
import { applyCategoryChange } from "./application/services/bulk/applyCategoryChange";
import { applyMemoChange } from "./application/services/bulk/applyMemoChange";
import { applyAccountChange } from "./application/services/bulk/applyAccountChange/applyAccountChange";
import { insertTransferTransaction } from "./application/services/insertTransferTransaction";
import { insertNormalTransaction } from "./application/services/insertNormalTransaction";
import { getTransactionById } from "./application/services/getTransactionById";

export const transactionService = {
  // insert
  insertTransferTransaction,
  insertNormalTransaction,

  // create
  createBalanceAdjustmentTransaction,
  createOpeningBalanceTransaction,

  // update
  updatePayeeForTransactions,

  // read
  getTransactionById,
  getTransactionsWithPairs,
  getTransactionsByCategoryId,

  // bulk
  bulk: {
    applyCategoryChange,
    applyAccountChange,
    applyMemoChange,
  },
};
