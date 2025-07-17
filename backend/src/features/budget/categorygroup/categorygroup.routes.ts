import { Router } from "express";
import {
  addCategoryGroup,
  deleteCategoryGroup,
  editCategoryGroup,
} from "./categorygroup.controller";

const router = Router();
router.post("/", addCategoryGroup);
router.patch("/", editCategoryGroup);
router.delete("/", deleteCategoryGroup);

export default router;
