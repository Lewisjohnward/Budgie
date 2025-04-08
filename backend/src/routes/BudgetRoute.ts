import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import {
  addAccount,
  addTransaction,
  deleteAccount,
  deleteTransaction,
  editAccount,
  editTransaction,
  getAccounts,
  getCategories,
  addCategory,
  addCategoryGroup,
  addPayee,
  editPayee,
  deletePayee,
  updateMonthForCategory,
} from "../controllers";

const router = express.Router();

router.use(Authenticate);

router.get("/account", getAccounts);
router.post("/account", addAccount);
router.patch("/account/:id", editAccount);
router.delete("/account/:id", deleteAccount);

router.post("/transaction", addTransaction);
router.patch("/transaction", editTransaction);
router.delete("/transaction", deleteTransaction);

router.get("/categories", getCategories);

router.post("/categoryGroup", addCategoryGroup);
router.post("/category", addCategory);

router.post("/payee", addPayee);
router.patch("/payee", editPayee);
router.delete("/payee", deletePayee);

router.patch("/month", updateMonthForCategory);

export { router as BudgetRoute };
