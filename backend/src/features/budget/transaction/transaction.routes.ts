import { Router } from "express";
import {
  addTransaction,
  deleteTransactions,
  duplicateTransactions,
  editTransaction,
  editSingleTransaction,
  editTransactionsBulk,
} from "./transaction.controller";

const router = Router();

router.post("/", addTransaction);
router.patch("/", editTransaction); // Legacy full update endpoint
router.delete("/", deleteTransactions);
router.post("/duplicate", duplicateTransactions);
router.patch("/bulk", editTransactionsBulk); // Must come before /:id route
router.patch("/:id", editSingleTransaction);

export default router;
