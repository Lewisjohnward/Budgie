import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import { getData } from "../controllers";

const router = express.Router();

router.use(Authenticate);
router.get("/data", getData);

export { router as BudgetRoute };
