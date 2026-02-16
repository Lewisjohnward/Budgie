import express from "express";
import {
  addAccount,
  deleteAccount,
  editAccount,
  getAccounts,
  toggleAccountClose,
} from "./account.controller";

const router = express.Router();

router.get("/", getAccounts);
router.post("/", addAccount);
router.patch("/:id", editAccount);
router.patch("/:id/close", toggleAccountClose);
router.delete("/:id", deleteAccount);

export default router;
