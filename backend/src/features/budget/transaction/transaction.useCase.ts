import { deleteTransactions } from "./application/use-cases/deleteTransactions";
import { updateTransactions } from "./application/use-cases/updateTransactions";
import { insertTransaction } from "./application/use-cases/insertTransaction";
import { duplicateTransactions } from "./application/use-cases/duplicateTransactions";
import { editTransactions } from "./application/use-cases/editTransactions";
import { editTransaction } from "./application/use-cases/editTransaction/editTransaction";

export const transactionUseCase = {
  deleteTransactions,
  updateTransactions,
  insertTransaction,
  duplicateTransactions,
  editTransaction,
  editTransactions,
};
