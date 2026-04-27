import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller";

const router = Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/", updateCategory);
router.delete("/", deleteCategory);

export default router;
