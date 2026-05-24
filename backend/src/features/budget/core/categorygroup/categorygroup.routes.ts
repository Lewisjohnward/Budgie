import { Router } from "express";
import {
  addCategoryGroup,
  deleteCategoryGroup,
  updateCategoryGroup,
  getCategoryGroups,
} from "./categorygroup.controller";

const router = Router();
router.get("/", getCategoryGroups);
router.post("/", addCategoryGroup);
router.patch("/", updateCategoryGroup);
router.delete("/", deleteCategoryGroup);

export default router;
