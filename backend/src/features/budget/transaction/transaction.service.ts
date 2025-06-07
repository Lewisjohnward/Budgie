import { deleteTransactions } from "./use-cases/deleteTransactions";
import { updateTransactions } from "./use-cases/updateTransactions";
import { insertTransaction } from "./use-cases/insertTransaction";
import { insertDuplicateTransactions } from "./use-cases/insertDuplicateTransactions";

export const transactionService = {
  deleteTransactions,
  updateTransactions,
  insertTransaction,
  insertDuplicateTransactions,
};
