import { Router } from "express";
import { getBudgetHydration } from "./hydration.controller";

const router = Router();

router.get("/", getBudgetHydration);

export default router;
