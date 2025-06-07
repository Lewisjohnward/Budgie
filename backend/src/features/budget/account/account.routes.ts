import express from "express";
import {
  addAccount,
  deleteAccount,
  editAccount,
  getAccounts,
} from "./account.controller";

const router = express.Router();

router.get("/", getAccounts);
router.post("/", addAccount);
router.patch("/", editAccount);
router.delete("/", deleteAccount);

export default router;
