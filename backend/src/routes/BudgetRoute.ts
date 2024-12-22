import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import {
  addAccount,
  addTransaction,
  deleteTransaction,
  editAccount,
  editTransaction,
  getAccounts,
} from "../controllers";

const router = express.Router();

router.use(Authenticate);

router.get("/accounts", getAccounts);
router.post("/accounts", addAccount);
router.patch("/accounts/:id", editAccount);
router.delete("/accounts/:id");

router.post("/transactions", addTransaction);
router.patch("/transactions/:id", editTransaction);
router.delete("/transactions/:id", deleteTransaction);
// Edit transaction

// Delete transaction

export { router as BudgetRoute };
