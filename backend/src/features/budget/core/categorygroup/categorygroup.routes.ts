import { Router } from "express";
import {
  addCategoryGroup,
  deleteCategoryGroup,
  editCategoryGroup,
  getCategoryGroups,
} from "./categorygroup.controller";

const router = Router();
router.get("/", getCategoryGroups);
router.post("/", addCategoryGroup);
router.patch("/", editCategoryGroup);
router.delete("/", deleteCategoryGroup);

export default router;
