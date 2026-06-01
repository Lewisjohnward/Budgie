import { Router } from "express";
import {
  deleteTransactions,
  duplicateTransactions,
  editSingleTransaction,
  editTransactionsBulk,
  createTransaction,
} from "./transaction.controller";

const router = Router();

router.post("/", createTransaction);
router.delete("/", deleteTransactions);
router.post("/duplicate", duplicateTransactions);
// Must come before /:id route
router.patch("/bulk", editTransactionsBulk);
router.patch("/:id", editSingleTransaction);

export default router;
