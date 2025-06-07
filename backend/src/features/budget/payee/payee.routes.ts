// payee.routes.ts
import { Router } from "express";
import { addPayee, editPayee, deletePayee } from "./payee.controller";

const router = Router();

router.post("/", addPayee);
router.put("/", editPayee);
router.delete("/", deletePayee);

export default router;
