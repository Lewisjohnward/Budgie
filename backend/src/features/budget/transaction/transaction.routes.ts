import { Router } from "express";
import {
  addTransaction,
  deleteTransactions,
  duplicateTransactions,
  editTransaction,
} from "./transaction.controller";

const router = Router();

router.post("/", addTransaction);
router.patch("/", editTransaction);
router.delete("/", deleteTransactions);
router.post("/duplicate", duplicateTransactions);

export default router;
