import { Router } from "express";
import { updateMonthForCategory } from "./assign.controller";

const router = Router();

router.patch("/", updateMonthForCategory);

export default router;