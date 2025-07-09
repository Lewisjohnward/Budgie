import { createBalanceAdjustmentTransaction } from "./application/services/createBalanceAdjustmentTransaction";
import { createOpeningBalanceTransaction } from "./application/services/createOpeningBalanceTransaction";

export const transactionService = {
    createBalanceAdjustmentTransaction,
    createOpeningBalanceTransaction
};
