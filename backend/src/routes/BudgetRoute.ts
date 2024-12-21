import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import { addAccount, addTransaction, data } from "../controllers";

const router = express.Router();

router.use(Authenticate);

router.get("/data", data);
router.post("/account", addAccount);

// Add transaction
router.post("/transaction", addTransaction);
// Edit transaction

// Delete transaction

export { router as BudgetRoute };
