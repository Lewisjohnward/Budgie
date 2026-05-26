import { Router } from "express";
import {
  createCategoryGroup,
  deleteCategoryGroup,
  updateCategoryGroup,
  getCategoryGroups,
} from "./categorygroup.controller";

const router = Router();
router.get("/", getCategoryGroups);
router.post("/", createCategoryGroup);
router.patch("/", updateCategoryGroup);
router.delete("/", deleteCategoryGroup);

export default router;
