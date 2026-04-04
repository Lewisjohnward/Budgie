import { Router } from "express";
import {
  getMonthsForCategories,
  updateMonthForCategory,
} from "./assign.controller";

const router = Router();

router.get("/", getMonthsForCategories);

router.patch("/", updateMonthForCategory);

export default router;
