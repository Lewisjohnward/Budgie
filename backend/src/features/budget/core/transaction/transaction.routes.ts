import { Router } from "express";
import {
  deleteTransactions,
  duplicateTransactions,
  editSingleTransaction,
  editTransactionsBulk,
  insertTransaction,
} from "./transaction.controller";

const router = Router();

router.post("/", insertTransaction);
router.delete("/", deleteTransactions);
router.post("/duplicate", duplicateTransactions);
// Must come before /:id route
router.patch("/bulk", editTransactionsBulk);
router.patch("/:id", editSingleTransaction);

export default router;
