import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import {
  addAccount,
  addCategory,
  addCategoryGroup,
  addPayee,
  addTransaction,
  deleteAccount,
  deleteCategory,
  deletePayee,
  deleteTransaction,
  duplicateTransactions,
  editAccount,
  editCategory,
  editPayee,
  editTransaction,
  getAccounts,
  getCategories,
} from "../controllers/budget/_index";
import { updateMonthForCategory } from "../controllers/budget/month.controller";

const router = express.Router();

router.use(Authenticate);

router.get("/accounts", getAccounts);
router.post("/account", addAccount);
router.patch("/account/:id", editAccount);
router.delete("/account/:id", deleteAccount);

router.post("/transaction", addTransaction);
router.patch("/transaction", editTransaction);
router.delete("/transaction", deleteTransaction);
router.post("/transaction/duplicate", duplicateTransactions);

router.get("/categories", getCategories);

router.post("/categoryGroup", addCategoryGroup);
router.post("/category", addCategory);
router.patch("/category", editCategory);
router.delete("/category", deleteCategory);

router.post("/payee", addPayee);
router.patch("/payee", editPayee);
router.delete("/payee", deletePayee);

router.patch("/month", updateMonthForCategory);

export { router as BudgetRoute };
