import { Router } from "express";
import {
  editPayee,
  deletePayee,
  getPayees,
  editPayeesInBulk,
  combinePayees,
  deletePayeesInBulk,
} from "./payee.controller";

const router = Router();

router.get("/", getPayees);
router.patch("/", editPayee);
router.delete("/", deletePayee);

router.patch("/bulk", editPayeesInBulk);
router.post("/combine", combinePayees);
router.delete("/bulk", deletePayeesInBulk);

export default router;
