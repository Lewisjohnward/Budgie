import express from "express";
import { Authenticate } from "../middleware/CommonAuth";
import { addAccount, data} from "../controllers";

const router = express.Router();

router.use(Authenticate);

router.get("/data", data);
router.post("/account", addAccount);

export { router as BudgetRoute };
