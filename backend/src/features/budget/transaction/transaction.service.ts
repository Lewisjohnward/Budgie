import { createBalanceAdjustmentTransaction } from "./application/services/createBalanceAdjustmentTransaction";
import { createOpeningBalanceTransaction } from "./application/services/createOpeningBalanceTransaction";
import {
    updateNormalTransaction,
    updateTransferTransaction,
} from "./application/services/updateTransaction";
import { updatePayeeForTransactions } from "./application/services/updatePayeeForTransactions";
import { getTransactionsWithPairs } from "./application/services/getTransactionsWithPairs";
import { applyCategoryChange } from "./application/services/bulk/applyCategoryChange";
import { applyMemoChange } from "./application/services/bulk/applyMemoChange";
import { applyAccountChange } from "./application/services/bulk/applyAccountChange/applyAccountChange";
import { insertTransferTransaction } from "./application/services/insertTransferTransaction";
import { insertNormalTransaction } from "./application/services/insertNormalTransaction";

export const transactionService = {
    // insert
    insertTransferTransaction,
    insertNormalTransaction,

    // create
    createBalanceAdjustmentTransaction,
    createOpeningBalanceTransaction,

    // update
    updateNormalTransaction,
    updateTransferTransaction,
    updatePayeeForTransactions,

    // read
    getTransactionsWithPairs,

    // bulk
    bulk: {
        applyCategoryChange,
        applyAccountChange,
        applyMemoChange,
    },
};
