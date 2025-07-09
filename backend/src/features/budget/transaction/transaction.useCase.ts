import { deleteTransactions } from "./application/use-cases/deleteTransactions";
import { updateTransactions } from "./application/use-cases/updateTransactions";
import { insertTransaction } from "./application/use-cases/insertTransaction";
import { insertDuplicateTransactions } from "./application/use-cases/insertDuplicateTransactions";

export const transactionUseCase = {
  deleteTransactions,
  updateTransactions,
  insertTransaction,
  insertDuplicateTransactions,
};
