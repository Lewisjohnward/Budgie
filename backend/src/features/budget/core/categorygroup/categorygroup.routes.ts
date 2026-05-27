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
router.patch("/:id", updateCategoryGroup);
router.delete("/:id", deleteCategoryGroup);

export default router;
